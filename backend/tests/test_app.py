import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from app import create_app
from sqlalchemy.exc import SQLAlchemyError


class TestAsyncFlaskRoute(unittest.TestCase):
    def setUp(self):
        self.client = create_app({"TESTING": True}).test_client()

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

    def test_unknown_route_returns_not_found(self):
        response = self.client.get("/missing")

        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    unittest.main()
