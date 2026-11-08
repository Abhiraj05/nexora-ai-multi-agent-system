from flask import Blueprint, abort, current_app, jsonify, request
from agent.research_agent import research_team

research_router = Blueprint("research", __name__, url_prefix="/api")


@research_router.post("/research")
async def research_route():
    data = request.get_json(silent=True)
    if not data:
        abort(400, description="'topic' must be a non-empty string")

    topic = data.get("topic")
    if not topic:
        abort(400, description="'topic' must be a non-empty string")

    try:
        result = await research_team.run(task=topic)
        report = result.messages[-1].content
        return jsonify(report.model_dump(mode="json"))
    except Exception:
        current_app.logger.exception("Research could not be completed.")
        abort(502, description="Research could not be completed. Please try again.")
