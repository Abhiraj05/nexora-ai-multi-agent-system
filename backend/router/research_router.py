from flask import Blueprint, abort, current_app, jsonify, request
from autogen_agentchat.messages import StructuredMessage
from agent.research_agent import create_research_team
from auth.jwt_token import get_current_user
from schemas.research_report_schemas import ResearchReport

research_router = Blueprint("research", __name__, url_prefix="/api")


# Generate a research report for the submitted topic.
@research_router.post("/research")
async def research_route():
    data = request.get_json(silent=True)
    if not data:
        abort(400, description="'topic' must be a non-empty string")

    topic = data.get("topic")
    if not topic:
        abort(400, description="'topic' must be a non-empty string")

    session_factory = current_app.extensions["async_db_session_factory"]
    async with session_factory() as db:
        await get_current_user(db)

    model_clients = ()
    try:
        research_team, model_clients = create_research_team()
        result = await research_team.run(task=topic)
        structured_message = next(
            (
                message
                for message in reversed(result.messages)
                if isinstance(message, StructuredMessage)
                and isinstance(message.content, ResearchReport)
            ),
            None,
        )
        if structured_message is None:
            raise ValueError("Research team did not return a structured report.")
        report = structured_message.content
        return jsonify(report.model_dump(mode="json"))
    except Exception:
        current_app.logger.exception("Research could not be completed.")
        abort(502, description="Research could not be completed. Please try again.")
    finally:
        for model_client in model_clients:
            try:
                await model_client.close()
            except Exception:
                current_app.logger.exception("Failed to close research model client.")
