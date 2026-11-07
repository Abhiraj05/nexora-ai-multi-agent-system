from datetime import datetime, timezone

from flask import Blueprint, abort, current_app, jsonify, request
from pydantic import ValidationError
from sqlalchemy import select
from werkzeug.security import check_password_hash

from auth.hash_password import hash_password
from auth.password_reset_utils import has_expired
from schemas.password_reset_schemas import ResetPasswordRequest
from sql.password_reset_model import PasswordResetCode
from sql.user_model import User

password_router = Blueprint("password", __name__, url_prefix="/api/auth")


@password_router.post("/reset-password")
def reset_password_route():
    data = request.get_json(silent=True)
    try:
        payload = ResetPasswordRequest.model_validate(data)
    except ValidationError as error:
        abort(400, description=str(error))

    email = payload.email.strip().lower()
    session_factory = current_app.extensions["db_session_factory"]
    with session_factory() as db:
        reset_code = db.scalar(
            select(PasswordResetCode)
            .join(User, User.id == PasswordResetCode.user_id)
            .where(User.email == email)
            .with_for_update()
        )
        now = datetime.now(timezone.utc)
        if (
            reset_code is None
            or reset_code.verified_at is None
            or has_expired(reset_code.expires_at, now)
            or not reset_code.reset_token_hash
            or not check_password_hash(reset_code.reset_token_hash, payload.reset_token)
        ):
            abort(400, description="Invalid or expired password reset session.")

        user = db.scalar(select(User).where(User.email == email))
        if user is None:
            abort(400, description="Invalid or expired password reset session.")

        user.password_hash = hash_password(payload.new_password)
        db.delete(reset_code)
        db.commit()

    return jsonify({"message": "Password updated successfully."})
