from flask import Blueprint, request, jsonify

recommend_bp = Blueprint("recommend", __name__)

@recommend_bp.route("/recommend", methods=["POST"])
def recommend():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Invalid input"
        }), 400

    return jsonify({
        "recommendations": [
            {
                "action_type": "UPDATE",
                "description": "Update outdated security patches",
                "priority": "HIGH"
            },
            {
                "action_type": "SCAN",
                "description": "Run vulnerability scan",
                "priority": "MEDIUM"
            },
            {
                "action_type": "BACKUP",
                "description": "Create backup before deployment",
                "priority": "LOW"
            }
        ]
    }), 200