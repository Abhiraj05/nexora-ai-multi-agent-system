import asyncio
import json
import logging
from pathlib import Path
from typing import Any, Callable
from dotenv import load_dotenv
from redis.asyncio import Redis

from cache.redis_client import redis_connection
from services.email_queue import (
    EMAIL_FAILED_KEY,
    EMAIL_PROCESSING_KEY,
    EMAIL_QUEUE_KEY,
)
from services.email_service import (
    deliver_feedback_email,
    deliver_password_reset_code,
    deliver_password_reset_success,
    deliver_signup_success,
)


load_dotenv(Path(__file__).resolve().parents[1] / ".env")

logger = logging.getLogger(__name__)
MAX_EMAIL_ATTEMPTS = 3
EMAIL_HANDLERS: dict[str, Callable[..., None]] = {
    "signup_success": deliver_signup_success,
    "password_reset_code": deliver_password_reset_code,
    "password_reset_success": deliver_password_reset_success,
    "feedback": deliver_feedback_email,
}


# Move an email job to the target queue.
async def _move_job(
    redis: Redis,
    current_job: str,
    destination: str | None,
    replacement_job: str | None = None,
) -> None:
    async with redis.pipeline(transaction=True) as pipeline:
        pipeline.lrem(EMAIL_PROCESSING_KEY, 1, current_job)
        if destination is not None and replacement_job is not None:
            pipeline.lpush(destination, replacement_job)
        await pipeline.execute()


# Validate and deliver a queued email job.
async def process_email_job(redis: Redis, raw_job: str) -> None:
    try:
        job: dict[str, Any] = json.loads(raw_job)
        if not isinstance(job, dict):
            raise ValueError("Email job must be a JSON object.")
        handler = EMAIL_HANDLERS[job["type"]]
        context = job["context"]
        if not isinstance(context, dict) or not all(
            isinstance(value, str) for value in context.values()
        ):
            raise ValueError("Email job context must contain string values.")
        attempts = job.get("attempts", 0)
        if not isinstance(attempts, int) or isinstance(attempts, bool) or attempts < 0:
            raise ValueError("Email job attempts must be a non-negative integer.")
    except (KeyError, TypeError, ValueError, json.JSONDecodeError) as error:
        logger.exception("Invalid email job.")
        await _move_job(
            redis,
            raw_job,
            EMAIL_FAILED_KEY,
            json.dumps({"job": raw_job, "error": str(error)}),
        )
        return

    try:
        await asyncio.to_thread(handler, **context)
    except Exception:
        logger.exception("Email job delivery failed.")
        job["attempts"] = job.get("attempts", 0) + 1
        failed = job["attempts"] >= MAX_EMAIL_ATTEMPTS
        replacement = json.dumps(job)
        destination = EMAIL_FAILED_KEY if failed else EMAIL_QUEUE_KEY
        await _move_job(redis, raw_job, destination, replacement)
        return

    await _move_job(redis, raw_job, None)
    logger.info("Email job delivered successfully.")


# Return unfinished email jobs to the queue.
async def _recover_processing_jobs(redis: Redis) -> None:
    recovered = 0
    while await redis.rpoplpush(EMAIL_PROCESSING_KEY, EMAIL_QUEUE_KEY):
        recovered += 1
    if recovered:
        logger.warning("Recovered %s unfinished email jobs.", recovered)


# Process email jobs from Redis.
async def email_worker() -> None:
    async with redis_connection() as redis:
        await _recover_processing_jobs(redis)
        logger.info("Email worker listening on %s.", EMAIL_QUEUE_KEY)
        while True:
            raw_job = await redis.brpoplpush(
                EMAIL_QUEUE_KEY,
                EMAIL_PROCESSING_KEY,
                timeout=5,
            )
            if raw_job is not None:
                await process_email_job(redis, raw_job)


# Start the email worker.
def main() -> None:
    logging.basicConfig(level=logging.INFO)
    asyncio.run(email_worker())


if __name__ == "__main__":
    main()
