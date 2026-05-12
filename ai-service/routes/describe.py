from flask import Blueprint, request, jsonify
from datetime import datetime

from services.prompt_loader import load_prompt
from services.groq_client import generate_ai_response

from services.response_formatter import (
    format_fallback_description
)

from services.cache_service import (
    get_cached_response,
    set_cached_response
)

from services.security import (
    validate_content_type
)
from services.logger_service import (
    log_info,
    log_error
)

from services.metrics import (
    increment_requests,
    increment_errors
)

describe_bp = Blueprint("describe", __name__)


@describe_bp.route("/describe", methods=["POST"])
def describe():

    try:

        # Validate Content-Type
        content_type_error = validate_content_type()

        if content_type_error:
            return content_type_error
        
        increment_requests()

        # Get request body
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "Request body is required"
            }), 400

        # Extract fields
        software = data.get("software")
        patch_status = data.get("patch_status")

        log_info(
            f"/describe called | "
            f"software={software} | "
            f"patch_status={patch_status}"
        )

        # Validate required fields
        if not software or not patch_status:
            return jsonify({
                "error": "software and patch_status are required"
            }), 400

        # Create cache key
        cache_key = f"{software}:{patch_status}"

        # Check Redis cache
        cached_response = get_cached_response(
            cache_key
        )

        # Return cached response
        if cached_response:

            cached_response["cache"] = "HIT"

            return jsonify(cached_response), 200

        # Load AI prompt
        prompt_template = load_prompt(
            "describe_prompt.txt"
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

            fallback = format_fallback_description(
                software,
                patch_status
            )

            fallback["generated_at"] = (
                datetime.utcnow().isoformat()
            )

            fallback["cache"] = "MISS"

            return jsonify(fallback), 200

        # Final response
        log_info(
            f"AI description generated "
            f"for {software}"
        )
        response_data = {
            "description": ai_response,
            "is_fallback": False,
            "generated_at": datetime.utcnow().isoformat()
        }

        # Store in Redis cache
        set_cached_response(
            cache_key,
            response_data
        )

        response_data["cache"] = "MISS"

        return jsonify(response_data), 200

    except Exception as error:

        increment_errors()

        log_error(str(error))

        return jsonify({
            "error": str(error)
        }), 500