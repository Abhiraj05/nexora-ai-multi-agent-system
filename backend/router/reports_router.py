from datetime import datetime, timezone

from flask import Blueprint, abort, current_app, jsonify, request
from pydantic import ValidationError
from sqlalchemy import select

from auth.jwt_token import get_current_user
from schemas.research_report_schemas import ResearchReport
from sql.report_model import Report

reports_router = Blueprint("reports", __name__, url_prefix="/api/reports")


def _serialize_report(report: Report) -> dict:
    return {
        "id": report.id,
        "title": report.title,
        "introduction": report.introduction,
        "background": report.background,
        "key_findings": report.key_findings,
        "benefits": report.benefits,
        "challenges": report.challenges,
        "conclusion": report.conclusion,
        "references": report.references,
    }


@reports_router.get("")
def list_reports_route():
    session_factory = current_app.extensions["db_session_factory"]
    with session_factory() as db:
        user = get_current_user(db)
        reports = db.scalars(
            select(Report)
            .where(Report.user_id == user.id)
            .order_by(Report.id.desc())
        ).all()
        return jsonify({"reports": [_serialize_report(report) for report in reports]})


@reports_router.post("")
def create_report_route():
    data = request.get_json(silent=True)
    try:
        payload = ResearchReport.model_validate(data)
    except ValidationError as error:
        abort(400, description=str(error))

    session_factory = current_app.extensions["db_session_factory"]
    with session_factory() as db:
        user = get_current_user(db)
        report = Report(
            user_id=user.id,
            title=payload.title,
            introduction=payload.introduction,
            background=payload.background,
            key_findings=payload.key_findings,
            benefits=payload.benefits,
            challenges=payload.challenges,
            conclusion=payload.conclusion,
            references=payload.references,
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        response = _serialize_report(report)
        response["createdAt"] = datetime.now(timezone.utc).isoformat()
        return jsonify(response), 201
