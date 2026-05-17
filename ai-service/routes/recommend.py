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

from services.prompt_loader import (
    load_prompt
)

from services.groq_client import (
    generate_ai_response
)

from services.response_formatter import (
    format_fallback_recommendations
)

from services.logger_service import (
    log_info,
    log_error
)

from services.metrics import (
    increment_requests,
    increment_errors
)


recommend_bp = Blueprint(
    "recommend",
    __name__
)


@swag_from({
    "tags": ["4. Recommend"],

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
                            "Windows Server 2022"
                        )
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
            "description": (
                "AI generated "
                "recommendations"
            )
        }
    }
})
@recommend_bp.route(
    "/recommend",
    methods=["POST"]
)
@jwt_required()
@limiter.limit("5 per minute")
def recommend():

    try:

        increment_requests()

        # Get request data

        data = request.get_json()

        # Validate request body

        if not data:

            return jsonify({
                "error": (
                    "Request body "
                    "is required"
                )
            }), 400

        # Extract fields

        software = data.get(
            "software"
        )

        patch_status = data.get(
            "patch_status"
        )

        log_info(
            f"/recommend called | "
            f"software={software} | "
            f"patch_status={patch_status}"
        )

        # Validate fields

        if not software or not patch_status:

            return jsonify({
                "error": (
                    "software and "
                    "patch_status "
                    "are required"
                )
            }), 400

        # Load prompt template

        prompt_template = (
            load_prompt(
                "recommend_prompt.txt"
            )
        )

        # Build prompt

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

        # Fallback if AI fails

        if not ai_response:

            fallback = (
                format_fallback_recommendations()
            )

            fallback["is_fallback"] = True

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
                format_fallback_recommendations()
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

        # Save recommendations to database

        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO ai_requests
            (
                api_name,
                software,
                patch_status,
                response
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                "recommend",
                software,
                patch_status,
                json.dumps(
                    parsed_response
                )
            )
        )

        connection.commit()

        connection.close()

        log_info(
            f"AI recommendations "
            f"generated for "
            f"{software}"
        )

        # Final response

        return jsonify({
            "recommendations": (
                parsed_response
            ),

            "is_fallback": False
        }), 200

    except Exception as error:

        increment_errors()

        log_error(
            str(error)
        )

        return jsonify({
            "error": str(error)
        }), 500