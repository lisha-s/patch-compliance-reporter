from flask import Blueprint, request, jsonify

describe_bp = Blueprint("describe", __name__)

@describe_bp.route("/describe", methods=["POST"])
def describe():

    data = request.get_json()

    return jsonify({
        "description": "Patch compliance issue detected",
        "generated_at": "2026-05-11"
    }), 200