from flask import Flask, abort, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from agent.research_agent import research_team

app = Flask(__name__)
# Allow the local frontend to call the API.
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})


@app.get("/api/test")
async def test_route():
    # Confirm the API is reachable.
    return jsonify({"status": "ok", "message": "Async Flask route is working"})


@app.post("/api/research")
async def research_route():
    # Read and validate the submitted topic.
    data = request.get_json(silent=True)
    try:
        topic = data.get("topic", "").strip()
        if not topic:
            abort(400, description="'topic' must be a non-empty string")
        
    # Run the research team and return its report.
        try:
            result = await research_team.run(task=topic)
            report = result.messages[-1].content
            return jsonify(report.model_dump(mode="json"))
        except:
            abort(502, description="Research could not be completed. Please try again.")
    except:
        abort(400, description="'topic' must be a non-empty string")

    


@app.errorhandler(HTTPException)
def handle_error(error):
    # Return HTTP errors in a consistent JSON format.
    return jsonify({
        "error": error.name,
        "message": error.description,
    }), error.code


if __name__ == "__main__":
    # Start the Flask development server locally.
    app.run(host="127.0.0.1", port=5000)