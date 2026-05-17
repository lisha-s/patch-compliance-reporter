from flask import (
    request,
    jsonify
)

import os


def validate_api_key():

    api_key = request.headers.get(
        "x-api-key"
    )

    expected_key = os.getenv(
        "API_KEY"
    )

    if not api_key:

        return jsonify({
            "error": (
                "API key missing"
            )
        }), 401

    if api_key != expected_key:

        return jsonify({
            "error": (
                "Invalid API key"
            )
        }), 403

    return None