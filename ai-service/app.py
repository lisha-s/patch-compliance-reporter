from flask import Flask
from flask_cors import CORS

from routes.describe import describe_bp
from routes.recommend import recommend_bp
from routes.report import report_bp
from routes.health import health_bp

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
        "status": "running"
    }

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)