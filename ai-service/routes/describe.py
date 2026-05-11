from flask import Blueprint, request, jsonify
from services.prompt_loader import load_prompt
from services.groq_client import generate_ai_response
from datetime import datetime

describe_bp = Blueprint("describe", __name__)


@describe_bp.route("/describe", methods=["POST"])
def describe():

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

        prompt_template = load_prompt("describe_prompt.txt")

        final_prompt = prompt_template.replace(
            "{input}",
            f"Software: {software}\nPatch Status: {patch_status}"
        )

        ai_response = generate_ai_response(final_prompt)

        if not ai_response:

            return jsonify({
                "description": f"{software} has {patch_status} patches.",
                "is_fallback": True,
                "generated_at": datetime.utcnow().isoformat()
            }), 200

        return jsonify({
            "description": ai_response,
            "is_fallback": False,
            "generated_at": datetime.utcnow().isoformat()
        }), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500