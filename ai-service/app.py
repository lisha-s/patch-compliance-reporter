import os

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from routes.describe import describe_bp
from routes.recommend import recommend_bp
from routes.report import report_bp
from routes.health import health_bp

load_dotenv()

app = Flask(__name__)

CORS(app)

app.register_blueprint(describe_bp)
app.register_blueprint(recommend_bp)
app.register_blueprint(report_bp)
app.register_blueprint(health_bp)


@app.route("/")
def home():

    return {
        "service": "Patch Compliance AI Service",
        "status": "running",
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