from flask import Blueprint, request, jsonify
from services.prompt_loader import load_prompt
from services.groq_client import generate_ai_response

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

        ai_response = generate_ai_response(final_prompt)

        if not ai_response:

            return jsonify({
                "recommendations": [
                    {
                        "action_type": "UPDATE",
                        "description": "Update software patches immediately.",
                        "priority": "HIGH"
                    }
                ],
                "is_fallback": True
            }), 200

        return jsonify({
            "recommendations": ai_response,
            "is_fallback": False
        }), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500