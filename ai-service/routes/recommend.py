import json

from flask import Blueprint, request, jsonify
from flasgger import swag_from

from services.prompt_loader import load_prompt
from services.groq_client import generate_ai_response
from services.response_formatter import (
    format_fallback_recommendations
)
from flask_jwt_extended import (
    jwt_required
)

recommend_bp = Blueprint("recommend", __name__)

@swag_from({
    "tags": ["Recommend"],
    "security": [
        {
            "Bearer": []
        }
    ],
    "consumes": [
        "application/json"
    ],
    "parameters": [
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "type": "object",
                "properties": {
                    "software": {
                        "type": "string",
                        "example": "Windows Server 2022"
                    },
                    "patch_status": {
                        "type": "string",
                        "example": "outdated"
                    }
                }
            }
        }
    ],
    "responses": {
        200: {
            "description": "AI generated recommendations"
        }
    }
})


@recommend_bp.route("/recommend", methods=["POST"])
@jwt_required()
def recommend():

    try:

        data = request.get_json()

        # Validate request body
        if not data:
            return jsonify({
                "error": "Request body is required"
            }), 400

        software = data.get("software")
        patch_status = data.get("patch_status")

        # Validate fields
        if not software or not patch_status:
            return jsonify({
                "error": "software and patch_status are required"
            }), 400

        # Load prompt template
        prompt_template = load_prompt(
            "recommend_prompt.txt"
        )

        # Build final prompt
        final_prompt = prompt_template.replace(
            "{input}",
            f"Software: {software}\n"
            f"Patch Status: {patch_status}"
        )

        # Generate AI response
        ai_response = generate_ai_response(
            final_prompt
        )

        # Fallback response
        if not ai_response:

            fallback = (
                format_fallback_recommendations()
            )

            return jsonify(fallback), 200

        # Parse AI JSON response
        try:

            parsed_response = json.loads(
                ai_response
            )

        except json.JSONDecodeError:

            fallback = (
                format_fallback_recommendations()
            )

            fallback["json_parse_error"] = True

            return jsonify(fallback), 200

        return jsonify({
            "recommendations": parsed_response,
            "is_fallback": False
        }), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500