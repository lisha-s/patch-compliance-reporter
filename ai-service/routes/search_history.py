from flask import (
    Blueprint,
    request
)

from flask_jwt_extended import (
    jwt_required
)

from flasgger import swag_from

from database.db import (
    get_connection
)

search_history_bp = Blueprint(
    "search_history",
    __name__
)


@swag_from({
    "tags": ["11. Search History"],

    "security": [
        {
            "Bearer": []
        }
    ],

    "parameters": [
        {
            "name": "software",
            "in": "query",
            "type": "string",
            "required": True
        }
    ],

    "responses": {
        200: {
            "description": (
                "Search AI history"
            )
        }
    }
})
@search_history_bp.route(
    "/search-history",
    methods=["GET"]
)
@jwt_required()
def search_history():

    software = request.args.get(
        "software"
    )

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM ai_requests
        WHERE software LIKE ?
        ORDER BY created_at DESC
        """,
        (
            f"%{software}%",
        )
    )

    rows = cursor.fetchall()

    history = []

    for row in rows:

        history.append({
            "api_name": row["api_name"],
            "software": row["software"],
            "patch_status": row["patch_status"],
            "response": row["response"],
            "created_at": row["created_at"]
        })

    connection.close()

    return {
        "results": history
    }, 200