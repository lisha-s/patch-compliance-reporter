from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    create_access_token
)

from flasgger import swag_from

auth_bp = Blueprint("auth", __name__)


@swag_from({
    "tags": ["1. Authentication"],
    "parameters": [
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "type": "object",
                "properties": {
                    "username": {
                        "type": "string",
                        "example": "admin"
                    },
                    "password": {
                        "type": "string",
                        "example": "admin123"
                    }
                }
            }
        }
    ],
    "responses": {
        200: {
            "description": "JWT token generated"
        }
    }
})
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    # Demo credentials
    if (
        username == "admin" and
        password == "admin123"
    ):

        access_token = create_access_token(
            identity=username
        )

        return jsonify({
            "access_token": access_token
        }), 200

    return jsonify({
        "error": "Invalid credentials"
    }), 401