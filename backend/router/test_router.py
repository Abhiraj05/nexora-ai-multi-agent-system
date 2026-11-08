from flask import Blueprint, jsonify

test_router = Blueprint("health", __name__, url_prefix="/api")


@test_router.get("/test")
async def test_route():
    return jsonify({"status": "ok", "message": "Async Flask route is working"})
