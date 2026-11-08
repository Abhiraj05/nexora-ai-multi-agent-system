import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


class Base(DeclarativeBase):
    pass


def configure_database(app: Flask) -> None:
    from sql import Report, User

    database_url = os.environ.get("DATABASE_URL")
    if not database_url or not database_url.startswith("postgresql"):
        raise RuntimeError("Set DATABASE_URL to a PostgreSQL connection URL in backend/.env.")

    async_database_url = make_url(database_url).set(
        drivername="postgresql+asyncpg",
    )
    async_engine = create_async_engine(async_database_url, poolclass=NullPool)
    app.extensions["async_db_session_factory"] = async_sessionmaker(
        bind=async_engine,
        autoflush=False,
        expire_on_commit=False,
    )
