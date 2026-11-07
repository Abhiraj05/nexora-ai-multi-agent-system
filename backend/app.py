import os
from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from router import (
    auth_router,
    email_router,
    health_router,
    otp_router,
    password_router,
    research_router,
)
from db.db_connection import configure_database


app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")
configure_database(app)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

app.register_blueprint(auth_router)
app.register_blueprint(email_router)
app.register_blueprint(health_router)
app.register_blueprint(otp_router)
app.register_blueprint(password_router)
app.register_blueprint(research_router)

@app.errorhandler(HTTPException)
def handle_error(error: HTTPException):
    return jsonify({
        "error": error.name,
        "message": error.description,
    }), error.code


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
