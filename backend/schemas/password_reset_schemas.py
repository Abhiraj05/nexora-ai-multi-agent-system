from pydantic import BaseModel, Field


# Validate an email address used by password-reset requests.
class EmailRequest(BaseModel):
    email: str = Field(
        min_length=3,
        max_length=255,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
    )


# Validate a submitted one-time password.
class VerifyOTPRequest(EmailRequest):
    otp: str = Field(pattern=r"^\d{6}$")


# Validate a request to set a new password.
class ResetPasswordRequest(EmailRequest):
    reset_token: str = Field(min_length=32)
    new_password: str = Field(min_length=8)
