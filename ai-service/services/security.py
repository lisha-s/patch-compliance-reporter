from flask import request, jsonify


def validate_content_type():

    if request.content_type != "application/json":

        return jsonify({
            "error": "Content-Type must be application/json"
        }), 415

    return None