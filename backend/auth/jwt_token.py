from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from flask import current_app, request
from sqlalchemy import select
from sqlalchemy.orm import Session
from werkzeug.exceptions import Unauthorized

from sql.user_model import User

ALGORITHM = "HS256"
TOKEN_LIFETIME = timedelta(hours=1)


def _secret_key() -> str:
    secret_key = current_app.config.get("SECRET_KEY")
    if not secret_key:
        raise RuntimeError("Flask SECRET_KEY must be configured to use JWT authentication.")
    return secret_key


def create_token(data: dict[str, Any]) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + TOKEN_LIFETIME
    return jwt.encode(payload, _secret_key(), algorithm=ALGORITHM)


def get_current_user(db: Session) -> User:
    authorization = request.headers.get("Authorization", "")
    scheme, separator, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not separator or not token:
        raise Unauthorized("A valid Bearer token is required.")

    try:
        payload = jwt.decode(token, _secret_key(), algorithms=[ALGORITHM])
    except jwt.InvalidTokenError as error:
        raise Unauthorized("Invalid or expired token.") from error

    email = payload.get("sub")
    if not email:
        raise Unauthorized("Token does not contain a valid subject.")

    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if user is None:
        raise Unauthorized("User associated with token was not found.")
    return user