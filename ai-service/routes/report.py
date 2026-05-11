import json

from flask import Blueprint, request, jsonify

from services.prompt_loader import load_prompt
from services.groq_client import generate_ai_response
from services.response_formatter import (
    format_fallback_report
)

report_bp = Blueprint("report", __name__)


@report_bp.route("/generate-report", methods=["POST"])
def generate_report():

    try:

        data = request.get_json()

        # Validate request body
        if not data:
            return jsonify({
                "error": "Request body is required"
            }), 400

        software = data.get("software")
        patch_status = data.get("patch_status")

        # Validate required fields
        if not software or not patch_status:
            return jsonify({
                "error": "software and patch_status are required"
            }), 400

        # Load report prompt
        prompt_template = load_prompt(
            "report_prompt.txt"
        )

        # Create final prompt
        final_prompt = prompt_template.replace(
            "{input}",
            f"Software: {software}\n"
            f"Patch Status: {patch_status}"
        )

        # Generate AI response
        ai_response = generate_ai_response(
            final_prompt
        )

        # Fallback handling
        if not ai_response:

            fallback = format_fallback_report()

            return jsonify(fallback), 200

        # Parse JSON response
        try:

            parsed_response = json.loads(
                ai_response
            )

        except json.JSONDecodeError:

            fallback = format_fallback_report()

            fallback["json_parse_error"] = True

            return jsonify(fallback), 200

        # Add metadata
        parsed_response["is_fallback"] = False

        return jsonify(parsed_response), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500