from flask import Blueprint
from flask_jwt_extended import (
    jwt_required
)

from flasgger import swag_from

from database.db import (
    get_connection
)

history_bp = Blueprint(
    "history",
    __name__
)


@swag_from({
    "tags": ["8. History"],

    "security": [
        {
            "Bearer": []
        }
    ],

    "responses": {
        200: {
            "description": (
                "AI request history"
            )
        }
    }
})
@history_bp.route(
    "/history",
    methods=["GET"]
)
@jwt_required()
def history():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM ai_requests
        ORDER BY created_at DESC
        """
    )

    rows = cursor.fetchall()

    history_data = []

    for row in rows:

        history_data.append({
            "id": row["id"],
            "api_name": row["api_name"],
            "software": row["software"],
            "patch_status": row["patch_status"],
            "response": row["response"],
            "created_at": row["created_at"]
        })

    connection.close()

    return {
        "history": history_data
    }, 200