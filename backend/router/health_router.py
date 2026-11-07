from flask import Blueprint, jsonify

health_router = Blueprint("health", __name__, url_prefix="/api")


@health_router.get("/test")
async def test_route():
    return jsonify({"status": "ok", "message": "Async Flask route is working"})
