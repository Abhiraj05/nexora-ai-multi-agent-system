import os
from pathlib import Path

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import StructuredMessage
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_core.models import ModelFamily
from autogen_ext.models.openai import OpenAIChatCompletionClient
from dotenv import load_dotenv
from schemas.research_report_schemas import ResearchReport

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

FREE_MODEL = "liquid/lfm-3-1.7b:free"


def _create_model_client(model: str) -> OpenAIChatCompletionClient:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("Set OPENROUTER_API_KEY in backend/.env.")
    client_options = {
        "base_url": "https://openrouter.ai/api/v1",
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
    researcher_model_client = _create_model_client(FREE_MODEL)
    analyst_model_client = _create_model_client(FREE_MODEL)
    writer_model_client = _create_model_client(FREE_MODEL)

    researcher_agent = AssistantAgent(
        name="researcher",
        model_client=researcher_model_client,
        system_message=(
            "Research the assigned topic. Return concise notes only: at most 5 "
            "bullets, each no more than 30 words, and at most 3 source URLs. "
            "Distinguish facts from uncertainty; do not write an introduction "
            "or conclusion."
        ),
    )
    analyst_agent = AssistantAgent(
        name="analyst",
        model_client=analyst_model_client,
        system_message=(
            "Analyze the available notes critically. Return at most 5 concise "
            "bullets, each no more than 25 words. Check assumptions and flag "
            "uncertainty without repeating the research notes."
        ),
    )
    writer_agent = AssistantAgent(
        name="writer",
        model_client=writer_model_client,
        output_content_type=ResearchReport,
        system_message=(
            "Return a concise ResearchReport using the provided research and "
            "analysis. Keep the title to 12 words; introduction and background "
            "to 2 sentences each; each key finding, benefit, and challenge to "
            "one sentence; and the conclusion to 2 sentences. Include no more "
            "than 3 findings, 3 benefits, 3 challenges, and 5 short references. "
            "Populate every field, avoid repetition, and do not invent facts. "
            "Stay brief so the complete structured response fits the model's "
            "completion limit."
        ),
    )

    team = RoundRobinGroupChat(
        participants=[researcher_agent, analyst_agent, writer_agent],
        max_turns=3,
        custom_message_types=[StructuredMessage[ResearchReport]],
    )
    return team, (
        researcher_model_client,
        analyst_model_client,
        writer_model_client,
    )
