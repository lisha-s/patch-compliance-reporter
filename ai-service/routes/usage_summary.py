from flask import Blueprint

from flask_jwt_extended import (
    jwt_required
)

from flasgger import swag_from

from database.db import (
    get_connection
)

usage_summary_bp = Blueprint(
    "usage_summary",
    __name__
)


@swag_from({
    "tags": ["16. Usage Summary"],

    "security": [
        {
            "Bearer": []
        }
    ],

    "responses": {
        200: {
            "description": (
                "AI usage analytics"
            )
        }
    }
})
@usage_summary_bp.route(
    "/usage-summary",
    methods=["GET"]
)
@jwt_required()
def usage_summary():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT api_name,
        COUNT(*) as total
        FROM ai_requests
        GROUP BY api_name
        """
    )

    rows = cursor.fetchall()

    summary = []

    for row in rows:

        summary.append({
            "api_name": (
                row["api_name"]
            ),
            "total_requests": (
                row["total"]
            )
        })

    connection.close()

    return {
        "usage_summary": (
            summary
        )
    }, 200