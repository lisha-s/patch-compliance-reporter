from flask import Blueprint, request, jsonify
from services.prompt_loader import load_prompt

recommend_bp = Blueprint("recommend", __name__)


@recommend_bp.route("/recommend", methods=["POST"])
def recommend():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "Request body is required"
            }), 400

        software = data.get("software")
        patch_status = data.get("patch_status")

        if not software or not patch_status:
            return jsonify({
                "error": "software and patch_status are required"
            }), 400

        prompt_template = load_prompt("recommend_prompt.txt")

        final_prompt = prompt_template.replace(
            "{input}",
            f"Software: {software}\nPatch Status: {patch_status}"
        )

        recommendations = [
            {
                "action_type": "UPDATE",
                "description": f"Update {software} to the latest security patch.",
                "priority": "HIGH"
            },
            {
                "action_type": "SCAN",
                "description": "Run a vulnerability assessment scan.",
                "priority": "MEDIUM"
            },
            {
                "action_type": "BACKUP",
                "description": "Create a backup before patch deployment.",
                "priority": "LOW"
            }
        ]

        return jsonify({
            "recommendations": recommendations,
            "prompt_used": final_prompt
        }), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500