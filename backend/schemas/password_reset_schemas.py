from pydantic import BaseModel, Field


class EmailRequest(BaseModel):
    email: str = Field(
        min_length=3,
        max_length=255,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
    )


class VerifyOTPRequest(EmailRequest):
    otp: str = Field(pattern=r"^\d{6}$")


class ResetPasswordRequest(EmailRequest):
    reset_token: str = Field(min_length=32)
    new_password: str = Field(min_length=8)
