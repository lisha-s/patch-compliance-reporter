def format_fallback_description(software, patch_status):
    
    return {
        "description": f"{software} currently has {patch_status} patches which may expose the system to security vulnerabilities.",
        "is_fallback": True
    }


def format_fallback_recommendations():

    return {
        "recommendations": [
            {
                "action_type": "UPDATE",
                "description": "Apply latest security patches immediately.",
                "priority": "HIGH"
            },
            {
                "action_type": "SCAN",
                "description": "Run a vulnerability assessment scan.",
                "priority": "MEDIUM"
            },
            {
                "action_type": "BACKUP",
                "description": "Create a backup before deployment.",
                "priority": "LOW"
            }
        ],
        "is_fallback": True
    }


def format_fallback_report():

    return {
        "title": "Patch Compliance Report",
        "summary": "AI service unavailable. Generated fallback report.",
        "risks": [
            "Security vulnerabilities",
            "Compliance issues"
        ],
        "recommendations": [
            "Apply latest patches",
            "Run security scans"
        ],
        "is_fallback": True
    }