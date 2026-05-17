from flask import (
    Blueprint,
    send_file
)

from flask_jwt_extended import (
    jwt_required
)

from flasgger import swag_from

backup_bp = Blueprint(
    "backup",
    __name__
)


@swag_from({
    "tags": ["13. Backup"],

    "security": [
        {
            "Bearer": []
        }
    ],

    "responses": {
        200: {
            "description": (
                "Download database backup"
            )
        }
    }
})
@backup_bp.route(
    "/backup-db",
    methods=["GET"]
)
@jwt_required()
def backup_database():

    return send_file(
        "database/patch_ai.db",
        as_attachment=True
    )