import asyncio
from functools import wraps
from inspect import iscoroutinefunction
import os
import sys
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


# Create the Windows selector event loop used by async Flask views.
def _create_selector_event_loop():
    loop = asyncio.SelectorEventLoop()
    asyncio.set_event_loop(loop)
    return loop


class Application(Flask):
    # Run async views with a selector loop on Windows.
    def ensure_sync(self, func):
        if sys.platform != "win32" or not iscoroutinefunction(func):
            return super().ensure_sync(func)

        @wraps(func)
        def run_with_selector_loop(*args, **kwargs):
            try:
                with asyncio.Runner(
                    loop_factory=_create_selector_event_loop
                ) as runner:
                    return runner.run(func(*args, **kwargs))
            finally:
                asyncio.set_event_loop(None)

        return run_with_selector_loop


# Create the Flask application and register its routes.
def create_app(test_config=None):
    app = Application(__name__)
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

    # Return a consistent JSON response for HTTP errors.
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
