from flask import Blueprint, abort, current_app, jsonify, request
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from redis.exceptions import RedisError
from auth.hash_password import hash_password
from auth.password_reset_utils import (
    OTP_TTL_SECONDS,
    password_reset_otp_key,
    password_reset_session_key,
)
from cache.redis_client import redis_connection
from core.otp_generator import generate_otp
from schemas.password_reset_schemas import EmailRequest
from services.email_queue import EmailQueueError
from services.email_service import send_password_reset_code
from sql.user_model import User

email_router = Blueprint("email", __name__, url_prefix="/api/auth")
GENERIC_RESPONSE = {
    "message": "If an account exists for this email, a verification code has been sent."
}


# Send a password-reset code by email.
async def _send_code():
    request_data = request.get_json(silent=True)
    try:
        data = EmailRequest.model_validate(request_data)
    except ValidationError as error:
        abort(400, description=str(error))

    email = data.email
    try:
        session_factory = current_app.extensions["async_db_session_factory"]
        async with session_factory() as db:
            user = await db.scalar(select(User).where(User.email == email))
            if user is None:
                return jsonify(GENERIC_RESPONSE)

            user_name = user.name
            otp = generate_otp()
        async with redis_connection() as redis:
            otp_key = password_reset_otp_key(email)
            async with redis.pipeline(transaction=True) as pipeline:
                pipeline.set(otp_key, hash_password(otp), ex=OTP_TTL_SECONDS)
                pipeline.delete(password_reset_session_key(email))
                await pipeline.execute()
            await send_password_reset_code(email, otp, user_name)
    except EmailQueueError as error:
        try:
            async with redis_connection() as redis:
                await redis.delete(password_reset_otp_key(email))
        except RedisError:
            current_app.logger.exception(
                "Could not clear undelivered password reset code.")
        current_app.logger.error(
            "Password reset email queueing failed: %s", error)
        abort(
            503,
            description="Could not queue the verification email. Please try again later.",
        )
    except (KeyError, RedisError, SQLAlchemyError):
        current_app.logger.exception(
            "Could not process password reset request.")
        abort(503, description="Could not process the request. Please try again later.")

    return jsonify(GENERIC_RESPONSE)


# Send a password-reset code to the user.
@email_router.post("/reset-password")
async def reset_password_email_route():
    return await _send_code()


# Resend a password-reset code.
@email_router.post("/resend-otp")
async def resend_otp_route():
    return await _send_code()
