import json
from redis.exceptions import RedisError
from cache.redis_client import redis_connection


EMAIL_QUEUE_KEY = "queue:emails"
EMAIL_PROCESSING_KEY = "queue:emails:processing"
EMAIL_FAILED_KEY = "queue:emails:failed"


class EmailQueueError(Exception):
    pass


# Add an email job to the Redis queue.
async def enqueue_email(job_type: str, **context: str) -> None:
    try:
        async with redis_connection() as redis:
            await redis.lpush(
                EMAIL_QUEUE_KEY,
                json.dumps({
                    "type": job_type,
                    "context": context,
                    "attempts": 0,
                }),
            )
    except RedisError as error:
        raise EmailQueueError("Could not queue the email.") from error
