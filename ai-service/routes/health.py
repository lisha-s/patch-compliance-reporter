import platform
import datetime

from flask import Blueprint

from services.metrics import get_metrics

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health():

    return {
        "status": "UP",
        "service": "ai-service",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "python_version": platform.python_version(),
        "platform": platform.system(),
        "metrics": get_metrics()
    }, 200