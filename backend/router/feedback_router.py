from flask import Blueprint, abort, current_app, jsonify, request
from pydantic import ValidationError

from schemas.feedback_schemas import FeedbackRequest
from services.email_queue import EmailQueueError
from services.email_service import send_feedback_email


feedback_router = Blueprint("feedback", __name__, url_prefix="/api")


# Receive and queue user feedback.
@feedback_router.post("/feedback")
async def feedback_route():
    request_data = request.get_json(silent=True)
    try:
        data = FeedbackRequest.model_validate(request_data)
    except ValidationError as error:
        abort(400, description=str(error))

    try:
        await send_feedback_email(data.name, data.email, data.message)
    except EmailQueueError:
        current_app.logger.exception("Could not queue feedback email.")
        abort(503, description="Could not queue feedback. Please try again later.")

    return jsonify({"message": "Feedback queued successfully."}), 202
