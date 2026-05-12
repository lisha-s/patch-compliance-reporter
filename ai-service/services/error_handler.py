from flask import jsonify


def api_error(
    message,
    status_code=500
):

    return jsonify({
        "success": False,
        "error": message
    }), status_code