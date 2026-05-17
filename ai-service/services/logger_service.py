import logging
import os
from flask import g
LOG_DIR = "logs"

if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

logging.basicConfig(
    filename=f"{LOG_DIR}/app.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


logger.info(
    f"[Request ID: {g.request_id}] "
    f"{message}"
)

def log_error(message):

    logger.error(message)