import json

from flask import Blueprint, request, jsonify
from flasgger import swag_from
from services.pdf_service import (
    generate_pdf_report
)

from services.prompt_loader import load_prompt
from services.groq_client import generate_ai_response

from services.response_formatter import (
    format_fallback_report
)
from flask_jwt_extended import (
    jwt_required
)
from services.security import (
    validate_content_type
)

from services.error_handler import (
    api_error
)

report_bp = Blueprint("report", __name__)


@swag_from({
    "tags": ["Report"],
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
                        "example": "Apache Tomcat"
                    },
                    "patch_status": {
                        "type": "string",
                        "example": "vulnerable"
                    }
                }
            }
        }
    ],
    "responses": {
        200: {
            "description": "AI generated compliance report"
        }
    }
})


@report_bp.route(
    "/generate-report",
    methods=["POST"]
)
@jwt_required()
def generate_report():

    try:

        # Validate content type
        content_type_error = (
            validate_content_type()
        )

        if content_type_error:
            return content_type_error

        # Get request body
        data = request.get_json()

        if not data:
            return api_error(
                "Request body is required",
                400
            )

        # Extract fields
        software = data.get("software")
        patch_status = data.get(
            "patch_status"
        )

        # Validate required fields
        if not software or not patch_status:

            return api_error(
                "software and patch_status are required",
                400
            )

        # Load prompt
        prompt_template = load_prompt(
            "report_prompt.txt"
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

        # Fallback handling
        if not ai_response:

            fallback = (
                format_fallback_report()
            )

            fallback["is_fallback"] = True

            return jsonify(
                fallback
            ), 200

        # Parse JSON response
        try:

            parsed_response = json.loads(
                ai_response
            )

        except json.JSONDecodeError:

            fallback = (
                format_fallback_report()
            )

            fallback[
                "json_parse_error"
            ] = True

            return jsonify(
                fallback
            ), 200

        # Final response
        parsed_response[
            "is_fallback"
        ] = False

        pdf_path = generate_pdf_report(
             software,
             patch_status,
             parsed_response.get(
                  "summary",
                  "No summary available"
            )
        )
        parsed_response[
            "pdf_report"
        ] = pdf_path

        return jsonify(
            parsed_response
        ), 200

    except Exception as error:

        return api_error(
            str(error),
            500
        )