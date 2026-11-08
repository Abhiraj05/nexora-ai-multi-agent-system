import os
from dotenv import load_dotenv
from redis.asyncio import Redis

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")

def redis_connection() -> Redis:
    return Redis.from_url(
        REDIS_URL or "redis://localhost:6379",
        decode_responses=True,
    )