import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from autogen_agentchat.messages import StructuredMessage
from app import create_app
from agent.research_agent import FREE_MODEL, _create_model_client, create_research_team
from auth.jwt_token import create_token
from db.db_connection import configure_database
from schemas.research_report_schemas import ResearchReport
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.pool import NullPool


class TestAsyncFlaskRoute(unittest.TestCase):
    def setUp(self):
        self.client = create_app({
            "TESTING": True,
            "SECRET_KEY": "test-secret-for-jwt-signing-at-least-32-bytes",
        }).test_client()

    def set_async_session_factory(self, db):
        session_context = AsyncMock()
        session_context.__aenter__.return_value = db
        self.client.application.extensions["async_db_session_factory"] = MagicMock(
            return_value=session_context,
        )

    def test_async_test_route(self):
        response = self.client.get("/api/test")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            {"status": "ok", "message": "Async Flask route is working"},
        )

    def test_list_reports_returns_error_when_fetch_fails(self):
        db = AsyncMock()
        db.scalars.side_effect = SQLAlchemyError("database unavailable")
        session_context = AsyncMock()
        session_context.__aenter__.return_value = db
        session_factory = MagicMock(return_value=session_context)
        self.client.application.extensions["async_db_session_factory"] = session_factory

        with patch(
            "router.reports_router.get_current_user",
            new=AsyncMock(return_value=SimpleNamespace(id=1)),
        ):
            response = self.client.get("/api/reports")

        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.get_json()["message"], "Failed to fetch records.")

    def test_create_report_saves_to_reports_endpoint(self):
        db = AsyncMock()
        db.add = MagicMock()

        async def refresh_report(report):
            report.id = 42

        db.refresh.side_effect = refresh_report
        self.set_async_session_factory(db)
        report_payload = {
            "title": "Test report",
            "introduction": "Introduction",
            "background": "Background",
            "key_findings": ["Finding"],
            "benefits": ["Benefit"],
            "challenges": ["Challenge"],
            "conclusion": "Conclusion",
            "references": ["https://example.com"],
        }

        with patch(
            "router.reports_router.get_current_user",
            new=AsyncMock(return_value=SimpleNamespace(id=1)),
        ):
            response = self.client.post("/api/reports", json=report_payload)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()["id"], 42)
        self.assertEqual(response.get_json()["title"], report_payload["title"])
        db.add.assert_called_once()
        db.commit.assert_awaited_once()
        db.refresh.assert_awaited_once()

    def test_unknown_route_returns_not_found(self):
        response = self.client.get("/missing")

        self.assertEqual(response.status_code, 404)

    def test_async_database_engine_does_not_reuse_connections(self):
        with (
            patch.dict("os.environ", {
                "DATABASE_URL": "postgresql://user:password@localhost/test",
            }),
            patch("db.db_connection.create_async_engine") as create_engine,
        ):
            configure_database(self.client.application)

        self.assertIs(create_engine.call_args.kwargs["poolclass"], NullPool)

    def test_model_client_uses_openrouter_endpoint_and_key(self):
        with (
            patch.dict("os.environ", {
                "OPENROUTER_API_KEY": "test-openrouter-key",
                "OPENAI_API_KEY": "unused-openai-key",
            }),
            patch("agent.research_agent.OpenAIChatCompletionClient") as client_factory,
        ):
            _create_model_client(FREE_MODEL)

        self.assertEqual(
            client_factory.call_args.kwargs["api_key"],
            "test-openrouter-key",
        )
        self.assertEqual(
            client_factory.call_args.kwargs["base_url"],
            "https://openrouter.ai/api/v1",
        )
        self.assertEqual(
            client_factory.call_args.kwargs["model"],
            FREE_MODEL,
        )

    def test_model_client_requires_openrouter_api_key(self):
        with (
            patch.dict("os.environ", {
                "OPENROUTER_API_KEY": "",
                "OPENAI_API_KEY": "unused-openai-key",
            }),
            patch("agent.research_agent.OpenAIChatCompletionClient") as client_factory,
        ):
            with self.assertRaisesRegex(RuntimeError, "OPENROUTER_API_KEY"):
                _create_model_client(FREE_MODEL)

        client_factory.assert_not_called()

    def test_research_team_factory_creates_fresh_loop_local_objects(self):
        created_clients = []

        def create_client(model):
            client = MagicMock()
            client.model = model
            created_clients.append(client)
            return client

        with (
            patch("agent.research_agent._create_model_client", side_effect=create_client),
            patch("agent.research_agent.AssistantAgent") as assistant_factory,
            patch(
                "agent.research_agent.RoundRobinGroupChat",
                side_effect=[MagicMock(), MagicMock()],
            ) as team_factory,
        ):
            first_team, first_clients = create_research_team()
            second_team, second_clients = create_research_team()

        self.assertIsNot(first_team, second_team)
        self.assertEqual(len(first_clients), 3)
        self.assertEqual(len(second_clients), 3)
        self.assertEqual(
            [client.model for client in created_clients],
            [FREE_MODEL] * 6,
        )
        self.assertTrue(
            {id(client) for client in first_clients}.isdisjoint(
                {id(client) for client in second_clients},
            ),
        )
        self.assertEqual(team_factory.call_count, 2)
        for call in team_factory.call_args_list:
            self.assertEqual(
                call.kwargs["custom_message_types"],
                [StructuredMessage[ResearchReport]],
            )
        writer_prompt = next(
            call.kwargs["system_message"]
            for call in assistant_factory.call_args_list
            if call.kwargs["name"] == "writer"
        )
        self.assertIn("no more than 3 findings", writer_prompt)
        self.assertIn("5 short references", writer_prompt)

    def test_research_requires_valid_token(self):
        db = AsyncMock()
        self.set_async_session_factory(db)

        with patch("router.research_router.create_research_team") as create_team:
            response = self.client.post(
                "/api/research",
                json={"topic": "Test topic"},
            )

        self.assertEqual(response.status_code, 401)
        create_team.assert_not_called()

    def test_research_rejects_invalid_token(self):
        db = AsyncMock()
        self.set_async_session_factory(db)

        with patch("router.research_router.create_research_team") as create_team:
            response = self.client.post(
                "/api/research",
                json={"topic": "Test topic"},
                headers={"Authorization": "Bearer invalid-token"},
            )

        self.assertEqual(response.status_code, 401)
        create_team.assert_not_called()

    def test_research_accepts_valid_token(self):
        db = AsyncMock()
        db.scalar.return_value = SimpleNamespace(id=1, email="user@example.com")
        self.set_async_session_factory(db)

        with self.client.application.app_context():
            token = create_token({"sub": "user@example.com"})

        report = {"title": "Test report"}
        model_clients = [SimpleNamespace(close=AsyncMock()) for _ in range(3)]
        team = SimpleNamespace(
            run=AsyncMock(
                return_value=SimpleNamespace(
                    messages=[
                        SimpleNamespace(
                            content=SimpleNamespace(
                                model_dump=lambda mode: report,
                            ),
                        ),
                    ],
                ),
            ),
        )
        with patch(
            "router.research_router.create_research_team",
            return_value=(team, tuple(model_clients)),
        ) as create_team:
            response = self.client.post(
                "/api/research",
                json={"topic": "Test topic"},
                headers={"Authorization": f"Bearer {token}"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), report)
        create_team.assert_called_once_with()
        team.run.assert_awaited_once_with(task="Test topic")
        for model_client in model_clients:
            model_client.close.assert_awaited_once_with()


if __name__ == "__main__":
    unittest.main()
