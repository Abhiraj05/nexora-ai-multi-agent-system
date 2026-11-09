import os
from pathlib import Path

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_agentchat.messages import StructuredMessage
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_core.models import ModelFamily
from autogen_ext.models.openai import OpenAIChatCompletionClient
from dotenv import load_dotenv
from schemas.research_report_schemas import ResearchReport

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

RESEARCHER_MODEL = "liquid/lfm-3-1.7b:free"
ANALYST_MODEL = "dots-studio/dots-3-note-preview:free"
WRITER_MODEL = "dots-studio/dots-3-note-preview:free"
RESEARCHER_MAX_TOKENS = 300
ANALYST_MAX_TOKENS = 200
WRITER_MAX_TOKENS = 700


# Create a model client with a per-response token budget.
def _create_model_client(
    model: str,
    max_tokens: int,
) -> OpenAIChatCompletionClient:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("Set OPENROUTER_API_KEY in backend/.env.")
    client_options = {
        "base_url": "https://openrouter.ai/api/v1",
        "extra_create_args": {"max_tokens": max_tokens},
        "model_info": {
            "vision": True,
            "function_calling": True,
            "json_output": True,
            "family": ModelFamily.UNKNOWN,
            "structured_output": True,
            "multiple_system_messages": True,
        },
    }
    client_options["api_key"] = api_key
    return OpenAIChatCompletionClient(model=model, **client_options)


def create_research_team() -> tuple[
    RoundRobinGroupChat,
    tuple[OpenAIChatCompletionClient, ...],
]:
    researcher_model_client = _create_model_client(
        RESEARCHER_MODEL,
        RESEARCHER_MAX_TOKENS,
    )
    analyst_model_client = _create_model_client(
        ANALYST_MODEL,
        ANALYST_MAX_TOKENS,
    )
    writer_model_client = _create_model_client(
        WRITER_MODEL,
        WRITER_MAX_TOKENS,
    )

    # The researcher gathers concise notes and source links.
    researcher_agent = AssistantAgent(
        name="researcher",
        model_client=researcher_model_client,
        system_message=(
            """Research the topic. Return at most 5 bullets, each no more than 
            30 words, plus at most 5 source URLs. Flag uncertainty. No intro 
            or conclusion."""
        ),
    )
    # The analyst checks assumptions and flags uncertainty.
    analyst_agent = AssistantAgent(
        name="analyst",
        model_client=analyst_model_client,
        system_message=(
            """Critically assess the research notes. Return at most 3 bullets, 
            each no more than 30 words. Flag unsupported claims and 
            uncertainty; do not repeat the notes."""
        ),
    )
    # The writer turns the notes into a structured report.
    writer_agent = AssistantAgent(
        name="writer",
        model_client=writer_model_client,
        output_content_type=ResearchReport,
        system_message=(
            """Return a concise ResearchReport based on the notes. Keep the 
            title under 10 words; introduction, background, and conclusion 
            to 3 sentence each; and each list item to 3 sentence. Include at 
            most 3 findings, 3 benefits, 3 challenges, and 3 references. 
            Populate every field, avoid repetition, and do not invent facts."""
        ),
    )

    team = RoundRobinGroupChat(
        participants=[researcher_agent, analyst_agent, writer_agent],
        termination_condition=(
            MaxMessageTermination(max_messages=4)
            | TextMentionTermination("TERMINATE")
        ),
        custom_message_types=[StructuredMessage[ResearchReport]],
    )
    return team, (
        researcher_model_client,
        analyst_model_client,
        writer_model_client,
    )
