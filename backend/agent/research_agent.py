from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_ext.models.openai import OpenAIChatCompletionClient
from schemas.research_report_schemas import ResearchReport

# Configure the model and role-specific instructions for research.
researcher_model_client = OpenAIChatCompletionClient(
    model="gpt-4.1",
)
researcher_agent = AssistantAgent(
    name="researcher",
    model_client=researcher_model_client,
    system_message=(
        "Research the assigned topic thoroughly. Identify relevant evidence, "
        "distinguish facts from uncertainty, and cite sources when provided."
    ),
)

# Configure the model and role-specific instructions for analysis.
analyst_model_client = OpenAIChatCompletionClient(
    model="o3",
)
analyst_agent = AssistantAgent(
    name="analyst",
    model_client=analyst_model_client,
    system_message=(
        "Analyze the available information critically. Check assumptions, "
        "compare evidence, and provide clear, reasoned conclusions."
    ),
)

# Configure the model and structured report output for writing.
writer_model_client = OpenAIChatCompletionClient(
    model="gpt-4.1-mini",
)
writer_agent = AssistantAgent(
    name="writer",
    model_client=writer_model_client,
    output_content_type=ResearchReport,
    system_message=(
        "Write clear, concise, well-structured content based on the provided "
        "research and analysis as a ResearchReport. Populate every field, "
        "including references, and do not invent unsupported facts."
    ),
)

# Run each agent once in researcher-analyst-writer order.
research_team = RoundRobinGroupChat(
    participants=[researcher_agent, analyst_agent, writer_agent],
    max_turns=3,
)
