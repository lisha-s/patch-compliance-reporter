from flask import Blueprint

from flask_jwt_extended import (
    jwt_required
)

from flasgger import swag_from

import os
import sqlite3


system_status_bp = Blueprint(
    "system_status",
    __name__
)


@swag_from({
    "tags": ["15. System Status"],

    "security": [
        {
            "Bearer": []
        }
    ],

    "responses": {
        200: {
            "description": (
                "System monitoring"
            )
        }
    }
})
@system_status_bp.route(
    "/system-status",
    methods=["GET"]
)
@jwt_required()
def system_status():

    db_exists = os.path.exists(
        "database/patch_ai.db"
    )

    logs_exists = os.path.exists(
        "logs/requests.log"
    )

    exports_exists = os.path.exists(
        "exports"
    )

    try:

        sqlite3.connect(
            "database/patch_ai.db"
        )

        database_status = (
            "connected"
        )

    except Exception:

        database_status = (
            "failed"
        )

    return {
        "database_file": db_exists,
        "database_status": (
            database_status
        ),
        "logs_available": logs_exists,
        "exports_available": (
            exports_exists
        ),
        "system_status": "healthy"
    }, 200