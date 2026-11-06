from pydantic import BaseModel, Field
from typing import List


class ResearchReport(BaseModel):

    title: str = Field(
        description="Title of the research report"
    )

    introduction: str = Field(
        description="Introduction to the research topic"
    )

    background: str = Field(
        description="Background information"
    )

    key_findings: List[str] = Field(
        description="Important research findings"
    )

    benefits: List[str] = Field(
        description="Major benefits"
    )

    challenges: List[str] = Field(
        description="Major challenges"
    )

    conclusion: str = Field(
        description="Overall conclusion"
    )

    references: List[str] = Field(
        description="Sources used in the research"
    )