from datetime import datetime, timezone
import secrets

from flask import Blueprint, abort, current_app, jsonify, request
from pydantic import ValidationError
from sqlalchemy import select
from werkzeug.security import check_password_hash, generate_password_hash

from auth.password_reset_utils import has_expired
from schemas.password_reset_schemas import VerifyOTPRequest
from sql.password_reset_model import PasswordResetCode
from sql.user_model import User

otp_router = Blueprint("otp", __name__, url_prefix="/api/auth")
MAX_OTP_ATTEMPTS = 5


@otp_router.post("/verify-otp")
def verify_otp_route():
    data = request.get_json(silent=True)
    try:
        payload = VerifyOTPRequest.model_validate(data)
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
        if reset_code is None or has_expired(reset_code.expires_at, now):
            abort(400, description="Invalid or expired verification code.")

        if reset_code.attempts >= MAX_OTP_ATTEMPTS:
            db.delete(reset_code)
            db.commit()
            abort(400, description="Invalid or expired verification code.")

        if not check_password_hash(reset_code.otp_hash, payload.otp):
            reset_code.attempts += 1
            if reset_code.attempts >= MAX_OTP_ATTEMPTS:
                db.delete(reset_code)
            db.commit()
            abort(400, description="Invalid or expired verification code.")

        reset_token = secrets.token_urlsafe(32)
        reset_code.verified_at = now
        reset_code.reset_token_hash = generate_password_hash(reset_token)
        db.commit()

    return jsonify({
        "message": "OTP verified successfully.",
        "reset_token": reset_token,
    })
