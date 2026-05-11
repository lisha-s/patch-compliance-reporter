import json

from flask import Blueprint, request, jsonify
from services.prompt_loader import load_prompt
from services.groq_client import generate_ai_response

report_bp = Blueprint("report", __name__)


@report_bp.route("/generate-report", methods=["POST"])
def generate_report():

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

        prompt_template = load_prompt("report_prompt.txt")

        final_prompt = prompt_template.replace(
            "{input}",
            f"Software: {software}\nPatch Status: {patch_status}"
        )

        ai_response = generate_ai_response(final_prompt)

        if not ai_response:

            return jsonify({
                "title": "Fallback Report",
                "summary": "AI service unavailable.",
                "risks": [
                    "Unknown vulnerabilities"
                ],
                "recommendations": [
                    "Apply latest patches"
                ],
                "is_fallback": True
            }), 200

        parsed_response = json.loads(ai_response)

        parsed_response["is_fallback"] = False

        return jsonify(parsed_response), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500