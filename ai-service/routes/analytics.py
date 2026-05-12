import os

from flask import Blueprint
from flasgger import swag_from

analytics_bp = Blueprint(
    "analytics",
    __name__
)


@swag_from({
    "tags": ["Analytics"],
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