from flask import (
    Blueprint,
    send_file
)

from flask_jwt_extended import (
    jwt_required
)

from flasgger import swag_from

from database.db import (
    get_connection
)

from services.export_service import (
    export_ai_requests
)

export_history_bp = Blueprint(
    "export_history",
    __name__
)


@swag_from({
    "tags": ["12. Export"],

    "security": [
        {
            "Bearer": []
        }
    ],

    "responses": {
        200: {
            "description": (
                "Export AI history CSV"
            )
        }
    }
})
@export_history_bp.route(
    "/export-history",
    methods=["GET"]
)
@jwt_required()
def export_history():

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

    connection.close()

    csv_path = (
        export_ai_requests(
            rows
        )
    )

    return send_file(
        csv_path,
        as_attachment=True
    )