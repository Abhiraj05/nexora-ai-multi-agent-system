import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


class Base(DeclarativeBase):
    pass


def configure_database(app: Flask) -> None:
    from sql import PasswordResetCode, Report, User

    database_url = os.environ.get("DATABASE_URL")
    if not database_url or not database_url.startswith("postgresql"):
        raise RuntimeError("Set DATABASE_URL to a PostgreSQL connection URL in backend/.env.")

    engine = create_engine(database_url)
    Base.metadata.create_all(engine)
    app.extensions["db_session_factory"] = sessionmaker(
        bind=engine,
        autoflush=False,
        expire_on_commit=False,
    )
