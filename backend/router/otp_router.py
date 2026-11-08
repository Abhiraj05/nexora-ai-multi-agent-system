import secrets

from flask import Blueprint, abort, current_app, jsonify, request
from pydantic import ValidationError
from redis.exceptions import RedisError
from werkzeug.security import check_password_hash, generate_password_hash

from auth.password_reset_utils import (
    password_reset_otp_key,
    password_reset_session_key,
)
from cache.redis_client import redis_connection
from schemas.password_reset_schemas import VerifyOTPRequest

otp_router = Blueprint("otp", __name__, url_prefix="/api/auth")


@otp_router.post("/verify-otp")
async def verify_otp_route():
    data = request.get_json(silent=True)
    try:
        payload = VerifyOTPRequest.model_validate(data)
    except ValidationError as error:
        abort(400, description=str(error))

    email = payload.email
    try:
        async with redis_connection() as redis:
            otp_key = password_reset_otp_key(email)
            session_key = password_reset_session_key(email)
            async with redis.lock(
                f"{otp_key}:verify-lock",
                timeout=10,
                blocking_timeout=5,
            ):
                otp_hash = await redis.get(otp_key)
                if not otp_hash:
                    abort(400, description="Invalid or expired verification code.")

                if not check_password_hash(otp_hash, payload.otp):
                    abort(400, description="Invalid or expired verification code.")

                otp_ttl = await redis.ttl(otp_key)
                if otp_ttl <= 0:
                    abort(400, description="Invalid or expired verification code.")

                reset_token = secrets.token_urlsafe(32)
                async with redis.pipeline(transaction=True) as pipeline:
                    pipeline.delete(otp_key)
                    pipeline.hset(
                        session_key,
                        mapping={
                            "reset_token_hash": generate_password_hash(reset_token),
                        },
                    )
                    pipeline.expire(session_key, otp_ttl)
                    await pipeline.execute()
    except RedisError:
        current_app.logger.exception("Could not verify password reset code.")
        abort(503, description="Could not process the request. Please try again later.")

    return jsonify({
        "message": "OTP verified successfully.",
        "reset_token": reset_token,
    })
