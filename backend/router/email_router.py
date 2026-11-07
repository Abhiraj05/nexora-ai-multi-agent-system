from datetime import datetime, timedelta, timezone
import secrets

from flask import Blueprint, abort, current_app, jsonify, request
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from auth.hash_password import hash_password
from schemas.password_reset_schemas import EmailRequest
from services.email_service import EmailDeliveryError, send_password_reset_code
from sql.password_reset_model import PasswordResetCode
from sql.user_model import User

email_router = Blueprint("email", __name__, url_prefix="/api/auth")
OTP_LIFETIME = timedelta(minutes=10)
GENERIC_RESPONSE = {
    "message": "If an account exists for this email, a verification code has been sent."
}


def _send_code():
    data = request.get_json(silent=True)
    try:
        payload = EmailRequest.model_validate(data)
    except ValidationError as error:
        abort(400, description=str(error))

    email = payload.email.strip().lower()
    session_factory = current_app.extensions["db_session_factory"]
    try:
        with session_factory() as db:
            user = db.scalar(select(User).where(User.email == email))
            if user is None:
                return jsonify(GENERIC_RESPONSE)

            otp = f"{secrets.randbelow(1_000_000):06d}"
            now = datetime.now(timezone.utc)
            reset_code = db.scalar(
                select(PasswordResetCode)
                .where(PasswordResetCode.user_id == user.id)
                .with_for_update()
            )
            if reset_code is None:
                reset_code = PasswordResetCode(user_id=user.id)
                db.add(reset_code)

            reset_code.otp_hash = hash_password(otp)
            reset_code.reset_token_hash = None
            reset_code.expires_at = now + OTP_LIFETIME
            reset_code.verified_at = None
            reset_code.attempts = 0

            send_password_reset_code(email, otp)
            db.commit()
    except EmailDeliveryError as error:
        current_app.logger.error("Password reset email delivery failed: %s", error)
        abort(503, description="Could not send the verification email. Please try again later.")
    except SQLAlchemyError:
        current_app.logger.exception("Could not save password reset code.")
        abort(503, description="Could not process the request. Please try again later.")

    return jsonify(GENERIC_RESPONSE)


@email_router.post("/forgot-password")
def forgot_password_route():
    return _send_code()


@email_router.post("/resend-otp")
def resend_otp_route():
    return _send_code()
