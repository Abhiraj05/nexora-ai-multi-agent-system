from pydantic import BaseModel, field_validator


class FeedbackRequest(BaseModel):
    name: str
    email: str
    message: str

    @field_validator("name", "email", "message")
    @classmethod
    def fields_must_not_be_empty(cls, value: str) -> str:
        if not value or value.isspace():
            raise ValueError("Field must not be empty.")
        return value
