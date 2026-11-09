import unittest
from datetime import datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_agentchat.messages import StructuredMessage
from app import create_app
from agent.research_agent import (
    ANALYST_MODEL,
    RESEARCHER_MODEL,
    WRITER_MODEL,
    _create_model_client,
    create_research_team,
)
from auth.jwt_token import create_token
from db.db_connection import configure_database
from schemas.research_report_schemas import ResearchReport
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.pool import NullPool


class TestAsyncFlaskRoute(unittest.TestCase):
    # Setup.
    def setUp(self):
        self.client = create_app({
            "TESTING": True,
            "SECRET_KEY": "test-secret-for-jwt-signing-at-least-32-bytes",
        }).test_client()

    # Set async session factory.
    def set_async_session_factory(self, db):
        session_context = AsyncMock()
        session_context.__aenter__.return_value = db
        self.client.application.extensions["async_db_session_factory"] = MagicMock(
            return_value=session_context,
        )

    # Test async test route.
    def test_async_test_route(self):
        response = self.client.get("/api/test")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            {"status": "ok", "message": "Async Flask route is working"},
        )

    # Test list reports returns error when fetch fails.
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

    # Test create report saves to reports endpoint.
    def test_create_report_saves_to_reports_endpoint(self):
        db = AsyncMock()
        db.add = MagicMock()

        # Refresh report.
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
        self.assertTrue(response.get_json()["createdAt"])
        db.add.assert_called_once()
        db.commit.assert_awaited_once()
        db.refresh.assert_awaited_once()

    # Test list reports includes persisted creation date.
    def test_list_reports_includes_persisted_creation_date(self):
        created_at = "2026-11-09T09:15:00+00:00"
        report = SimpleNamespace(
            id=42,
            title="Test report",
            introduction="Introduction",
            background="Background",
            key_findings=["Finding"],
            benefits=["Benefit"],
            challenges=["Challenge"],
            conclusion="Conclusion",
            references=["https://example.com"],
            created_at=datetime.fromisoformat(created_at),
        )
        db = AsyncMock()
        result = MagicMock()
        result.all.return_value = [report]
        db.scalars.return_value = result
        self.set_async_session_factory(db)

        with patch(
            "router.reports_router.get_current_user",
            new=AsyncMock(return_value=SimpleNamespace(id=1)),
        ):
            response = self.client.get("/api/reports")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["reports"][0]["createdAt"], created_at)

    # Test delete report removes report owned by current user.
    def test_delete_report_removes_report_owned_by_current_user(self):
        user = SimpleNamespace(id=1)
        report = SimpleNamespace(id=42, user_id=1)
        db = AsyncMock()
        db.scalar.return_value = report
        self.set_async_session_factory(db)

        with patch(
            "router.reports_router.get_current_user",
            new=AsyncMock(return_value=user),
        ):
            response = self.client.delete("/api/reports/42")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json()["message"],
            "Report deleted successfully.",
        )
        db.delete.assert_awaited_once_with(report)
        db.commit.assert_awaited_once()

    # Test delete report returns not found for other users report.
    def test_delete_report_returns_not_found_for_other_users_report(self):
        db = AsyncMock()
        db.scalar.return_value = None
        self.set_async_session_factory(db)

        with patch(
            "router.reports_router.get_current_user",
            new=AsyncMock(return_value=SimpleNamespace(id=1)),
        ):
            response = self.client.delete("/api/reports/42")

        self.assertEqual(response.status_code, 404)
        db.delete.assert_not_awaited()
        db.commit.assert_not_awaited()

    # Test profile endpoint returns authenticated user.
    def test_profile_endpoint_returns_authenticated_user(self):
        user = SimpleNamespace(id=1, name="Ada Lovelace", email="ada@example.com")
        db = AsyncMock()
        self.set_async_session_factory(db)

        with patch(
            "router.auth_router.get_current_user",
            new=AsyncMock(return_value=user),
        ):
            response = self.client.get("/api/auth/profile")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["user"], {
            "id": 1,
            "name": "Ada Lovelace",
            "email": "ada@example.com",
        })

    # Test profile update changes name and email and returns new token.
    def test_profile_update_changes_name_and_email_and_returns_new_token(self):
        user = SimpleNamespace(id=1, name="Ada", email="ada@example.com")
        db = AsyncMock()
        db.scalar.return_value = None
        self.set_async_session_factory(db)

        with patch(
            "router.auth_router.get_current_user",
            new=AsyncMock(return_value=user),
        ):
            response = self.client.patch(
                "/api/auth/profile",
                json={"name": "Ada Lovelace", "email": "ADA@EXAMPLE.COM"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["user"], {
            "id": 1,
            "name": "Ada Lovelace",
            "email": "ada@example.com",
        })
        self.assertTrue(response.get_json()["access_token"])
        db.commit.assert_awaited_once()

    # Test profile delete removes authenticated user.
    def test_profile_delete_removes_authenticated_user(self):
        user = SimpleNamespace(id=1, name="Ada", email="ada@example.com")
        db = AsyncMock()
        self.set_async_session_factory(db)

        with patch(
            "router.auth_router.get_current_user",
            new=AsyncMock(return_value=user),
        ):
            response = self.client.delete("/api/auth/profile")

        self.assertEqual(response.status_code, 200)
        db.delete.assert_awaited_once_with(user)
        db.commit.assert_awaited_once()

    # Test unknown route returns not found.
    def test_unknown_route_returns_not_found(self):
        response = self.client.get("/missing")

        self.assertEqual(response.status_code, 404)

    # Test async database engine does not reuse connections.
    def test_async_database_engine_does_not_reuse_connections(self):
        with (
            patch.dict("os.environ", {
                "DATABASE_URL": "postgresql://user:password@localhost/test",
            }),
            patch("db.db_connection.create_async_engine") as create_engine,
        ):
            configure_database(self.client.application)

        self.assertIs(create_engine.call_args.kwargs["poolclass"], NullPool)

    # Test model client uses openrouter endpoint and key.
    def test_model_client_uses_openrouter_endpoint_and_key(self):
        with (
            patch.dict("os.environ", {
                "OPENROUTER_API_KEY": "test-openrouter-key",
                "OPENAI_API_KEY": "unused-openai-key",
            }),
            patch("agent.research_agent.OpenAIChatCompletionClient") as client_factory,
        ):
            _create_model_client(RESEARCHER_MODEL, 300)

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
            RESEARCHER_MODEL,
        )
        self.assertEqual(
            client_factory.call_args.kwargs["extra_create_args"],
            {"max_tokens": 300},
        )

    # Test model client requires openrouter api key.
    def test_model_client_requires_openrouter_api_key(self):
        with (
            patch.dict("os.environ", {
                "OPENROUTER_API_KEY": "",
                "OPENAI_API_KEY": "unused-openai-key",
            }),
            patch("agent.research_agent.OpenAIChatCompletionClient") as client_factory,
        ):
            with self.assertRaisesRegex(RuntimeError, "OPENROUTER_API_KEY"):
                _create_model_client(RESEARCHER_MODEL, 300)

        client_factory.assert_not_called()

    # Test research team factory creates fresh loop local objects.
    def test_research_team_factory_creates_fresh_loop_local_objects(self):
        created_clients = []

        # Create client.
        def create_client(model, max_tokens):
            client = MagicMock()
            client.model = model
            client.max_tokens = max_tokens
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
            [RESEARCHER_MODEL, ANALYST_MODEL, WRITER_MODEL] * 2,
        )
        self.assertEqual(
            [client.max_tokens for client in created_clients],
            [300, 200, 700] * 2,
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
            max_message_termination, text_termination = (
                call.kwargs["termination_condition"]._conditions
            )
            self.assertIsInstance(max_message_termination, MaxMessageTermination)
            self.assertEqual(max_message_termination._max_messages, 4)
            self.assertIsInstance(text_termination, TextMentionTermination)
            self.assertEqual(text_termination._termination_text, "TERMINATE")
        writer_prompt = next(
            call.kwargs["system_message"]
            for call in assistant_factory.call_args_list
            if call.kwargs["name"] == "writer"
        )
        self.assertIn("2 findings", writer_prompt)
        self.assertIn("3 references", writer_prompt)

    # Test research requires valid token.
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

    # Test research rejects invalid token.
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

    # Test research accepts valid token.
    def test_research_accepts_valid_token(self):
        db = AsyncMock()
        db.scalar.return_value = SimpleNamespace(id=1, email="user@example.com")
        self.set_async_session_factory(db)

        with self.client.application.app_context():
            token = create_token({"sub": "user@example.com"})

        report_model = ResearchReport(
            title="Test report",
            introduction="An introduction.",
            background="Some background.",
            key_findings=["A key finding."],
            benefits=["A benefit."],
            challenges=["A challenge."],
            conclusion="A conclusion.",
            references=["https://example.com"],
        )
        report = report_model.model_dump(mode="json")
        model_clients = [SimpleNamespace(close=AsyncMock()) for _ in range(3)]
        team = SimpleNamespace(
            run=AsyncMock(
                return_value=SimpleNamespace(
                    messages=[
                        StructuredMessage[ResearchReport](
                            content=report_model,
                            source="writer",
                        ),
                        SimpleNamespace(
                            content="Additional plain-text message.",
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
