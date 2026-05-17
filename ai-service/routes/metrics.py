import os

from flask import Blueprint
from flasgger import swag_from

metrics_bp = Blueprint(
    "metrics",
    __name__
)


@swag_from({
    "tags": ["7. Metrics"],

    "responses": {
        200: {
            "description": "Metrics endpoint"
        }
    }
})
@metrics_bp.route(
    "/metrics",
    methods=["GET"]
)
def metrics():

    log_path = "logs/requests.log"

    if not os.path.exists(log_path):

        return {
            "error": "Log file not found"
        }, 404

    log_size = os.path.getsize(
        log_path
    )

    return {
        "request_log_size_bytes": log_size,
        "status": "active",
        "log_file": "requests.log"
    }, 200