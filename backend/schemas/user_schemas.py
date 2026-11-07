from pydantic import BaseModel, ConfigDict, Field

from .research_report_schemas import ResearchReport


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8)


class UserSignIn(BaseModel):
    email: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1)


class ReportRead(ResearchReport):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class UserRead(BaseModel):
    id: int
    name: str
    email: str
    reports: list[ReportRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)