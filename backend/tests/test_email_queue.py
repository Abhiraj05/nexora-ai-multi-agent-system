import json
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from services.email_queue import (
    EMAIL_FAILED_KEY,
    EMAIL_PROCESSING_KEY,
    EMAIL_QUEUE_KEY,
    enqueue_email,
)
from services.email_service import deliver_signup_success
from services.email_worker import process_email_job


class TestEmailQueue(unittest.IsolatedAsyncioTestCase):
    # Test enqueue email pushes json job to redis list.
    @patch("services.email_queue.redis_connection")
    async def test_enqueue_email_pushes_json_job_to_redis_list(self, connection_factory):
        redis = AsyncMock()
        connection_factory.return_value = redis
        redis.__aenter__.return_value = redis

        await enqueue_email("signup_success", email="a@b.com", username="Ada")

        connection_factory.assert_called_once_with()
        redis.lpush.assert_awaited_once()
        queue_key, raw_job = redis.lpush.await_args.args
        self.assertEqual(queue_key, EMAIL_QUEUE_KEY)
        self.assertEqual(
            json.loads(raw_job),
            {
                "type": "signup_success",
                "context": {"email": "a@b.com", "username": "Ada"},
                "attempts": 0,
            },
        )
        redis.__aenter__.assert_awaited_once_with()
        redis.__aexit__.assert_awaited_once()

    # Test signup email renders jinja template.
    @patch("services.email_service._send_email")
    def test_signup_email_renders_jinja_template(self, send_email):
        deliver_signup_success("ada@example.com", "<Ada>")

        html_body = send_email.call_args.args[3]
        self.assertIn("&lt;Ada&gt;", html_body)
        self.assertIn("ada@example.com", html_body)

    # Test successful delivery removes job from processing list.
    @patch("services.email_worker.asyncio.to_thread", new_callable=AsyncMock)
    async def test_successful_delivery_removes_job_from_processing_list(self, send):
        pipeline = MagicMock()
        pipeline.execute = AsyncMock()
        redis = MagicMock()
        redis.pipeline.return_value.__aenter__.return_value = pipeline
        raw_job = json.dumps({
            "type": "signup_success",
            "context": {"email": "a@b.com", "username": "Ada"},
            "attempts": 0,
        })

        await process_email_job(redis, raw_job)

        send.assert_awaited_once()
        pipeline.lrem.assert_called_once_with(EMAIL_PROCESSING_KEY, 1, raw_job)
        pipeline.execute.assert_awaited_once()
        pipeline.lpush.assert_not_called()

    # Test failed delivery is requeued with attempt count.
    @patch(
        "services.email_worker.asyncio.to_thread",
        new_callable=AsyncMock,
        side_effect=RuntimeError("SMTP unavailable"),
    )
    async def test_failed_delivery_is_requeued_with_attempt_count(self, send):
        pipeline = MagicMock()
        pipeline.execute = AsyncMock()
        redis = MagicMock()
        redis.pipeline.return_value.__aenter__.return_value = pipeline
        raw_job = json.dumps({
            "type": "signup_success",
            "context": {"email": "a@b.com", "username": "Ada"},
            "attempts": 0,
        })

        await process_email_job(redis, raw_job)

        pipeline.lrem.assert_called_once_with(EMAIL_PROCESSING_KEY, 1, raw_job)
        queue_key, retried_job = pipeline.lpush.call_args.args
        self.assertEqual(queue_key, EMAIL_QUEUE_KEY)
        self.assertEqual(json.loads(retried_job)["attempts"], 1)
        pipeline.execute.assert_awaited_once()

    # Test delivery is dead lettered after max attempts.
    @patch(
        "services.email_worker.asyncio.to_thread",
        new_callable=AsyncMock,
        side_effect=RuntimeError("SMTP unavailable"),
    )
    async def test_delivery_is_dead_lettered_after_max_attempts(self, send):
        pipeline = MagicMock()
        pipeline.execute = AsyncMock()
        redis = MagicMock()
        redis.pipeline.return_value.__aenter__.return_value = pipeline
        raw_job = json.dumps({
            "type": "signup_success",
            "context": {"email": "a@b.com", "username": "Ada"},
            "attempts": 2,
        })

        await process_email_job(redis, raw_job)

        queue_key, failed_job = pipeline.lpush.call_args.args
        self.assertEqual(queue_key, EMAIL_FAILED_KEY)
        self.assertEqual(json.loads(failed_job)["attempts"], 3)

    # Test invalid job is moved to failed list.
    async def test_invalid_job_is_moved_to_failed_list(self):
        pipeline = MagicMock()
        pipeline.execute = AsyncMock()
        redis = MagicMock()
        redis.pipeline.return_value.__aenter__.return_value = pipeline
        raw_job = "not-json"

        await process_email_job(redis, raw_job)

        queue_key, failed_job = pipeline.lpush.call_args.args
        self.assertEqual(queue_key, EMAIL_FAILED_KEY)
        self.assertEqual(json.loads(failed_job)["job"], raw_job)


if __name__ == "__main__":
    unittest.main()
