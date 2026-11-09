from datetime import datetime, timezone

OTP_TTL_SECONDS = 10 * 60


# Build the Redis key for a password-reset OTP.
def password_reset_otp_key(email: str) -> str:
    return f"password-reset:otp:{email}"


# Build the Redis key for a password-reset session.
def password_reset_session_key(email: str) -> str:
    return f"password-reset:session:{email}"


# Check whether a timestamp has expired.
def has_expired(expires_at: datetime, now: datetime) -> bool:
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at <= now
