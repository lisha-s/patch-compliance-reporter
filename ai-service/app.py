import os
import time

from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
from flasgger import Swagger
from routes.metrics import metrics_bp
from routes.analytics import (
    analytics_bp
)

from flask_jwt_extended import (
    JWTManager
)
from middleware.limiter import limiter
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from routes.history import history_bp
from routes.describe import describe_bp
from routes.recommend import recommend_bp
from routes.report import report_bp
from routes.health import health_bp
from routes.auth import auth_bp
from flask import request

from routes.dashboard import dashboard_bp

from routes.report_history import (
    report_history_bp
)
from routes.export_history import (
    export_history_bp
)
from routes.search_history import (
    search_history_bp
)

from middleware.request_logger import (
    request_logger
)
from routes.backup import (
    backup_bp
)
from middleware.request_tracker import (
    assign_request_id
)
from routes.audit_logs import (
    audit_logs_bp
)

from routes.system_status import (
    system_status_bp
)

from routes.usage_summary import (
    usage_summary_bp
)

load_dotenv()

app = Flask(__name__)
@app.before_request
def before_request():

    assign_request_id()

@app.after_request
def add_security_headers(response):

    response.headers[
        "X-Content-Type-Options"
    ] = "nosniff"

    response.headers[
        "X-Frame-Options"
    ] = "DENY"

    response.headers[
        "X-XSS-Protection"
    ] = "1; mode=block"

    return response
limiter.init_app(app)

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

    "specs_route": "/apidocs/",

    "swagger_ui_config": {
        "operationsSorter": "alpha",
        "tagsSorter": "alpha"
    }
}

swagger_template = {
    "swagger": "2.0",

    "info": {
        "title": "Patch Compliance AI API",
        "description": "AI powered patch compliance APIs",
        "version": "1.0"
    },

    "tags": [
        {
            "name": "1. Authentication"
        },
        {
            "name": "2. Health"
        },
        {
            "name": "3. Describe"
        },
        {
            "name": "4. Recommend"
        },
        {
            "name": "5. Report"
        },
        {
            "name": "6. Analytics"
        }
    ],

    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": (
                "JWT Authorization header using "
                "Bearer scheme. Example: "
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
# Authentication First

app.register_blueprint(
    auth_bp,
    url_prefix="/api/v1"
)

# Health Second

app.register_blueprint(
    health_bp,
    url_prefix="/api/v1"
)

# Protected AI APIs

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

# Analytics Last

app.register_blueprint(
    analytics_bp,
    url_prefix="/api/v1"
)
app.register_blueprint(
    metrics_bp,
    url_prefix="/api/v1"
)

app.register_blueprint(
    history_bp,
    url_prefix="/api/v1"
)
app.register_blueprint(
    dashboard_bp,
    url_prefix="/api/v1"
)

app.register_blueprint(
    report_history_bp,
    url_prefix="/api/v1"
)

app.register_blueprint(
    search_history_bp,
    url_prefix="/api/v1"
)
app.register_blueprint(
    export_history_bp,
    url_prefix="/api/v1"
)

app.register_blueprint(
    backup_bp,
    url_prefix="/api/v1"
)
app.register_blueprint(
    audit_logs_bp,
    url_prefix="/api/v1"
)

app.register_blueprint(
    system_status_bp,
    url_prefix="/api/v1"
)

app.register_blueprint(
    usage_summary_bp,
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

from flask import request

from middleware.request_logger import (
    request_logger
)


@app.before_request
def log_request():

    request_logger.info(
        f"{request.method} "
        f"{request.path}"
    )
if __name__ == "__main__":

    port = int(
        os.getenv("PORT", 5000)
    )

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )