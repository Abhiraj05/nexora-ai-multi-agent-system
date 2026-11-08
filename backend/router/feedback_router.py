from flask import Blueprint, abort, current_app, jsonify, request
from pydantic import ValidationError

from schemas.feedback_schemas import FeedbackRequest
from services.email_service import EmailDeliveryError, send_feedback_email


feedback_router = Blueprint("feedback", __name__, url_prefix="/api")


@feedback_router.post("/feedback")
def feedback_route():
    request_data = request.get_json(silent=True)
    try:
        data = FeedbackRequest.model_validate(request_data)
    except ValidationError as error:
        abort(400, description=str(error))

    try:
        send_feedback_email(data.name, data.email, data.message)
    except EmailDeliveryError:
        current_app.logger.exception("Could not deliver feedback email.")
        abort(503, description="Could not send feedback. Please try again later.")

    return jsonify({"message": "Feedback sent successfully."})
