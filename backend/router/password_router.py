from flask import Blueprint, abort, current_app, jsonify, request
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from redis.exceptions import RedisError
from werkzeug.security import check_password_hash
from auth.hash_password import hash_password
from auth.password_reset_utils import password_reset_session_key
from cache.redis_client import redis_connection
from schemas.password_reset_schemas import ResetPasswordRequest
from services.email_queue import EmailQueueError
from services.email_service import send_password_reset_success
from sql.user_model import User

password_router = Blueprint("password", __name__, url_prefix="/api/auth")
INVALID_RESET_MESSAGE = "Invalid or expired password reset session."


# Update the user's password after verification.
@password_router.post("/update-password")
async def update_password_route():
    data = request.get_json(silent=True)
    try:
        payload = ResetPasswordRequest.model_validate(data)
    except ValidationError as error:
        abort(400, description=str(error))

    email = payload.email
    user_name = ""
    try:
        async with redis_connection() as redis:
            key = password_reset_session_key(email)
            reset_state = await redis.hgetall(key)
            reset_token_hash = reset_state.get("reset_token_hash", "")
            if (
                not reset_state
                or "consumed" in reset_state
                or not reset_token_hash
                or not check_password_hash(reset_token_hash, payload.reset_token)
            ):
                abort(400, description=INVALID_RESET_MESSAGE)

            if not await redis.hsetnx(key, "consumed", "1"):
                abort(400, description=INVALID_RESET_MESSAGE)

            session_factory = current_app.extensions["async_db_session_factory"]
            async with session_factory() as db:
                try:
                    user = await db.scalar(select(User).where(User.email == email))
                    if user is None:
                        abort(400, description=INVALID_RESET_MESSAGE)

                    user.password_hash = hash_password(payload.new_password)
                    user_name = user.name
                    await db.commit()
                except SQLAlchemyError:
                    await db.rollback()
                    raise
    except SQLAlchemyError:
        current_app.logger.exception("Failed to process password reset.")
        abort(500, description="Could not process password reset.")
    except (KeyError, RedisError):
        current_app.logger.exception("Could not process password reset.")
        abort(503, description="Could not process password reset.")

    try:
        await send_password_reset_success(email, user_name)
    except EmailQueueError:
        current_app.logger.exception(
            "Password changed, but confirmation email could not be queued.")
        return jsonify({
            "message": "Password updated successfully, but the confirmation email could not be sent."
        })

    return jsonify({"message": "Password updated successfully."})
