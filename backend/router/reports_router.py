from datetime import datetime, timezone
from flask import Blueprint, abort, current_app, jsonify, request
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from auth.jwt_token import get_current_user
from schemas.research_report_schemas import ResearchReport
from sql.report_model import Report

reports_router = Blueprint("reports", __name__, url_prefix="/api")


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


@reports_router.get("/reports")
async def list_reports_route():
    try:
        session_factory = current_app.extensions["async_db_session_factory"]
        async with session_factory() as db:
            user = await get_current_user(db)
            if not user:
                abort(401, description="User not found.")

            result = await db.scalars(
                select(Report)
                .where(Report.user_id == user.id)
                .order_by(Report.id.desc())
            )
            reports = result.all()
            return jsonify({"reports": [_serialize_report(report) for report in reports]})
    except SQLAlchemyError:
        current_app.logger.exception("Failed to fetch reports.")
        abort(500, description="Failed to fetch records.")


@reports_router.post("/reports")
async def create_report_route():
    data = request.get_json(silent=True)
    try:
        payload = ResearchReport.model_validate(data)
    except ValidationError as error:
        abort(400, description=str(error))

    try:
        session_factory = current_app.extensions["async_db_session_factory"]
        async with session_factory() as db:
            try:
                user = await get_current_user(db)
                if not user:
                    abort(401, description="User not found.")

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
                await db.commit()
                await db.refresh(report)
            except SQLAlchemyError:
                await db.rollback()
                raise

            response = _serialize_report(report)
            response["createdAt"] = datetime.now(timezone.utc).isoformat()
            return jsonify(response), 201
    except SQLAlchemyError:
        current_app.logger.exception("Failed to create report.")
        abort(500, description="Failed to create report.")


@reports_router.delete("/reports/<int:report_id>")
async def delete_report_route(report_id: int):
    try:
        session_factory = current_app.extensions["async_db_session_factory"]
        async with session_factory() as db:
            user = await get_current_user(db)
            report = await db.scalar(
                select(Report).where(
                    Report.id == report_id,
                    Report.user_id == user.id,
                )
            )
            if report is None:
                abort(404, description="Report not found.")

            await db.delete(report)
            await db.commit()
            return jsonify({"message": "Report deleted successfully."})
    except SQLAlchemyError:
        current_app.logger.exception("Failed to delete report.")
        abort(500, description="Failed to delete report.")
