from flask import Blueprint

from flask_jwt_extended import (
    jwt_required
)

from flasgger import swag_from

from database.db import (
    get_connection
)

report_history_bp = Blueprint(
    "report_history",
    __name__
)


@swag_from({
    "tags": ["10. Report History"],

    "security": [
        {
            "Bearer": []
        }
    ],

    "responses": {
        200: {
            "description": (
                "Generated report history"
            )
        }
    }
})
@report_history_bp.route(
    "/report-history",
    methods=["GET"]
)
@jwt_required()
def report_history():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM reports
        ORDER BY created_at DESC
        """
    )

    rows = cursor.fetchall()

    reports = []

    for row in rows:

        reports.append({
            "id": row["id"],
            "software": row["software"],
            "patch_status": row["patch_status"],
            "file_name": row["file_name"],
            "created_at": row["created_at"]
        })

    connection.close()

    return {
        "reports": reports
    }, 200