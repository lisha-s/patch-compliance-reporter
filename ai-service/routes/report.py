import json

from flask import (
    Blueprint,
    request,
    jsonify
)

from flasgger import swag_from

from flask_jwt_extended import (
    jwt_required
)

from middleware.limiter import (
    limiter
)

from database.db import (
    get_connection
)

from services.pdf_service import (
    generate_pdf_report
)

from services.prompt_loader import (
    load_prompt
)

from services.groq_client import (
    generate_ai_response
)

from services.response_formatter import (
    format_fallback_report
)

from services.security import (
    validate_content_type
)

from services.error_handler import (
    api_error
)

from services.logger_service import (
    log_info,
    log_error
)

from services.metrics import (
    increment_requests,
    increment_errors
)


report_bp = Blueprint(
    "report",
    __name__
)


@swag_from({
    "tags": ["5. Report"],

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
                        "example": (
                            "Apache Tomcat"
                        )
                    },

                    "patch_status": {
                        "type": "string",
                        "example": (
                            "vulnerable"
                        )
                    }
                }
            }
        }
    ],

    "responses": {
        200: {
            "description": (
                "AI generated "
                "compliance report"
            )
        }
    }
})
@report_bp.route(
    "/generate-report",
    methods=["POST"]
)
@jwt_required()
@limiter.limit("3 per minute")
def generate_report():

    try:

        increment_requests()

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

        software = data.get(
            "software"
        )

        patch_status = data.get(
            "patch_status"
        )

        log_info(
            f"/generate-report called | "
            f"software={software} | "
            f"patch_status={patch_status}"
        )

        # Validate required fields

        if not software or not patch_status:

            return api_error(
                "software and "
                "patch_status "
                "are required",
                400
            )

        # Load prompt template

        prompt_template = (
            load_prompt(
                "report_prompt.txt"
            )
        )

        # Build final prompt

        final_prompt = (
            prompt_template.replace(
                "{input}",
                f"Software: {software}\n"
                f"Patch Status: "
                f"{patch_status}"
            )
        )

        # Generate AI response

        ai_response = (
            generate_ai_response(
                final_prompt
            )
        )

        # Fallback handling

        if not ai_response:

            fallback = (
                format_fallback_report()
            )

            fallback[
                "is_fallback"
            ] = True

            return jsonify(
                fallback
            ), 200

        # Parse AI JSON response

        try:

            parsed_response = (
                json.loads(
                    ai_response
                )
            )

        except json.JSONDecodeError:

            fallback = (
                format_fallback_report()
            )

            fallback[
                "json_parse_error"
            ] = True

            fallback[
                "is_fallback"
            ] = True

            return jsonify(
                fallback
            ), 200

        # Generate PDF report

        pdf_path = (
            generate_pdf_report(
                software,
                patch_status,
                parsed_response.get(
                    "summary",
                    "No summary available"
                )
            )
        )

        parsed_response[
            "pdf_report"
        ] = pdf_path

        parsed_response[
            "is_fallback"
        ] = False

        # Save report metadata to database

        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO reports
            (
                software,
                patch_status,
                file_name
            )
            VALUES (?, ?, ?)
            """,
            (
                software,
                patch_status,
                pdf_path
            )
        )

        connection.commit()

        connection.close()

        log_info(
            f"AI report generated "
            f"for {software}"
        )

        # Final response

        return jsonify(
            parsed_response
        ), 200

    except Exception as error:

        increment_errors()

        log_error(
            str(error)
        )

        return api_error(
            str(error),
            500
        )