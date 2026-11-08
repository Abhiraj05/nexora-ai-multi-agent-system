import asyncio
import os
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from router import (
    auth_router,
    email_router,
    test_router,
    otp_router,
    password_router,
    research_router,
    reports_router,
    feedback_router,
)
from db.db_connection import configure_database


def create_app(test_config=None):
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")
    if test_config:
        app.config.update(test_config)

    if not app.config.get("TESTING"):
        configure_database(app)

    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
    app.register_blueprint(test_router)
    app.register_blueprint(auth_router)
    app.register_blueprint(email_router)
    app.register_blueprint(otp_router)
    app.register_blueprint(password_router)
    app.register_blueprint(research_router)
    app.register_blueprint(reports_router)
    app.register_blueprint(feedback_router)

    @app.errorhandler(HTTPException)
    def handle_error(error: HTTPException):
        return jsonify({
            "error": error.name,
            "message": error.description,
        }), error.code

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
