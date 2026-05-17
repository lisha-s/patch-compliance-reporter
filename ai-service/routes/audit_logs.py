from flask import Blueprint

from flask_jwt_extended import (
    jwt_required
)

from flasgger import swag_from

import os


audit_logs_bp = Blueprint(
    "audit_logs",
    __name__
)


@swag_from({
    "tags": ["14. Audit Logs"],

    "security": [
        {
            "Bearer": []
        }
    ],

    "responses": {
        200: {
            "description": (
                "Application audit logs"
            )
        }
    }
})
@audit_logs_bp.route(
    "/audit-logs",
    methods=["GET"]
)
@jwt_required()
def audit_logs():

    log_path = (
        "logs/requests.log"
    )

    if not os.path.exists(
        log_path
    ):

        return {
            "logs": []
        }, 200

    with open(
        log_path,
        "r",
        encoding="utf-8"
    ) as file:

        logs = file.readlines()

    return {
        "logs": logs[-50:]
    }, 200