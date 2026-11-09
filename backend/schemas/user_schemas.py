from pydantic import BaseModel, ConfigDict, Field

from .research_report_schemas import ResearchReport


# Validate the fields required to create a user account.
class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8)


# Validate the credentials used to sign in.
class UserSignIn(BaseModel):
    email: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1)


# Validate fields that can be changed in a user profile.
class UserProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: str | None = Field(default=None, min_length=1, max_length=255)


# Represent a research report returned with its database identifiers.
class ReportRead(ResearchReport):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


# Represent a user and their saved reports.
class UserRead(BaseModel):
    id: int
    name: str
    email: str
    reports: list[ReportRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)