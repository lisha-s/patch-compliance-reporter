import os
import time

from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
from flasgger import Swagger

from flask_jwt_extended import (
    JWTManager
)

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from routes.describe import describe_bp
from routes.recommend import recommend_bp
from routes.report import report_bp
from routes.health import health_bp
from routes.auth import auth_bp

load_dotenv()

app = Flask(__name__)

CORS(app)

swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/apispec.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/apidocs/"
}

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Patch Compliance AI API",
        "description": "AI powered patch compliance APIs",
        "version": "1.0"
    },
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": (
                "JWT Authorization header "
                "using Bearer scheme. "
                "Example: "
                "'Bearer {token}'"
            )
        }
    }
}

swagger = Swagger(
    app,
    config=swagger_config,
    template=swagger_template
)

# JWT Configuration
app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY",
    "super-secret-key"
)

jwt = JWTManager(app)

# Rate Limiter
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["50 per hour"]
)

# Register Blueprints
app.register_blueprint(
    auth_bp,
    url_prefix="/api/v1"
)

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
        "security": "enabled",
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