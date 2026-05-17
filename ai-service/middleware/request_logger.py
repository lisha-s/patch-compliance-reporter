import logging
import os

# Create logs folder automatically

if not os.path.exists("logs"):
    os.makedirs("logs")

# Create logger

request_logger = logging.getLogger(
    "request_logger"
)

request_logger.setLevel(logging.INFO)

# Prevent duplicate handlers

if not request_logger.handlers:

    file_handler = logging.FileHandler(
        "logs/requests.log"
    )

    formatter = logging.Formatter(
        "%(asctime)s "
        "%(levelname)s "
        "%(message)s"
    )

    file_handler.setFormatter(
        formatter
    )

    request_logger.addHandler(
        file_handler
    )