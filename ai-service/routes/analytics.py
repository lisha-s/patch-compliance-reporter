import os

from flask import Blueprint
from flasgger import swag_from

from flask_jwt_extended import (
    jwt_required
)

analytics_bp = Blueprint(
    "analytics",
    __name__
)


@swag_from({
    "tags": ["6. Analytics"],

    "security": [
        {
            "Bearer": []
        }
    ],

    "responses": {
        200: {
            "description": "Analytics endpoint"
        }
    }
})
@analytics_bp.route(
    "/analytics",
    methods=["GET"]
)
@jwt_required()
def analytics():

    report_count = len(
        os.listdir(
            "generated_reports"
        )
    )

    return {
        "generated_reports": report_count,
        "status": "active"
    }, 200