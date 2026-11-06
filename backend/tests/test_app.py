import unittest

from app import create_app


class TestAsyncFlaskRoute(unittest.TestCase):
    def setUp(self):
        self.client = create_app().test_client()

    def test_async_test_route(self):
        response = self.client.get("/api/test")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            {"status": "ok", "message": "Async Flask route is working"},
        )

    def test_unknown_route_returns_not_found(self):
        response = self.client.get("/missing")

        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    unittest.main()
