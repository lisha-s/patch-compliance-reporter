import os
import time

from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
from flasgger import Swagger

from routes.describe import describe_bp
from routes.recommend import recommend_bp
from routes.report import report_bp
from routes.health import health_bp

load_dotenv()

app = Flask(__name__)

CORS(app)

swagger = Swagger(app)

app.register_blueprint(
    describe_bp,
    url_prefix="/api/v1"
)

app.register_blueprint(
    recommend_bp,
    url_prefix="/api/v1"
)

app.register_blueprint(
    report_bp,
    url_prefix="/api/v1"
)

app.register_blueprint(
    health_bp,
    url_prefix="/api/v1"
)


@app.before_request
def before_request():

    request.start_time = time.time()


@app.after_request
def after_request(response):

    duration = (
        time.time() -
        request.start_time
    )

    response.headers[
        "X-Response-Time"
    ] = f"{duration:.4f}s"

    return response


@app.route("/")
def home():

    return {
        "service": "Patch Compliance AI Service",
        "status": "running",
        "version": "v1",
        "environment": os.getenv(
            "FLASK_ENV",
            "development"
        )
    }


if __name__ == "__main__":

    port = int(
        os.getenv("PORT", 5000)
    )

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )