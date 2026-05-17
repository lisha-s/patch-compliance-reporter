import logging

from flask import g


logging.basicConfig(
    filename="logs/requests.log",
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger(__name__)


def log_info(message):

    request_id = getattr(
        g,
        "request_id",
        "N/A"
    )

    logger.info(
        f"[Request ID: {request_id}] "
        f"{message}"
    )


def log_error(message):

    request_id = getattr(
        g,
        "request_id",
        "N/A"
    )

    logger.error(
        f"[Request ID: {request_id}] "
        f"{message}"
    )