from flask import Blueprint

from flask_jwt_extended import (
    jwt_required
)

from flasgger import swag_from
from middleware.api_key import (
    validate_api_key
)
from database.db import (
    get_connection
)

dashboard_bp = Blueprint(
    "dashboard",
    __name__
)


@swag_from({
    "tags": ["9. Dashboard"],

    "security": [
        {
            "Bearer": []
        }
    ],

    "parameters": [
        {
            "name": "x-api-key",
            "in": "header",
            "type": "string",
            "required": True,
            "default": "patch_secure_2026"
        }
    ],

    "responses": {
        200: {
            "description": (
                "Dashboard analytics"
            )
        }
    }
})
@dashboard_bp.route(
    "/dashboard",
    methods=["GET"]
)
@jwt_required()
def dashboard():
    api_key_error = (
        validate_api_key()
    )
    
    if api_key_error:
        return api_key_error

    connection = get_connection()

    cursor = connection.cursor()

    # Total AI requests

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM ai_requests
        """
    )

    total_ai_requests = (
        cursor.fetchone()[0]
    )

    # Total reports

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM reports
        """
    )

    total_reports = (
        cursor.fetchone()[0]
    )

    # Latest requests

    cursor.execute(
        """
        SELECT *
        FROM ai_requests
        ORDER BY created_at DESC
        LIMIT 5
        """
    )

    rows = cursor.fetchall()

    latest_requests = []

    for row in rows:

        latest_requests.append({
            "api_name": row["api_name"],
            "software": row["software"],
            "patch_status": row["patch_status"],
            "created_at": row["created_at"]
        })

    connection.close()

    return {
        "total_ai_requests": (
            total_ai_requests
        ),

        "total_reports": (
            total_reports
        ),

        "latest_requests": (
            latest_requests
        )
    }, 200