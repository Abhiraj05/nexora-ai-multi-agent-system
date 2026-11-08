from datetime import datetime, timezone

OTP_TTL_SECONDS = 10 * 60


def password_reset_otp_key(email: str) -> str:
    return f"password-reset:otp:{email}"


def password_reset_session_key(email: str) -> str:
    return f"password-reset:session:{email}"


def has_expired(expires_at: datetime, now: datetime) -> bool:
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at <= now
