import os
from datetime import datetime

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)

from reportlab.lib.styles import (
    getSampleStyleSheet
)


REPORT_DIR = "generated_reports"

if not os.path.exists(REPORT_DIR):
    os.makedirs(REPORT_DIR)


def generate_pdf_report(
    software,
    patch_status,
    ai_summary
):

    timestamp = datetime.utcnow().strftime(
        "%Y%m%d%H%M%S"
    )

    filename = (
        f"{software}_{timestamp}.pdf"
    )

    filepath = os.path.join(
        REPORT_DIR,
        filename
    )

    doc = SimpleDocTemplate(filepath)

    styles = getSampleStyleSheet()

    elements = []

    title = Paragraph(
        "Patch Compliance Report",
        styles["Title"]
    )

    elements.append(title)

    elements.append(
        Spacer(1, 20)
    )

    elements.append(
        Paragraph(
            f"<b>Software:</b> {software}",
            styles["BodyText"]
        )
    )

    elements.append(
        Paragraph(
            f"<b>Patch Status:</b> {patch_status}",
            styles["BodyText"]
        )
    )

    elements.append(
        Spacer(1, 20)
    )

    elements.append(
        Paragraph(
            ai_summary,
            styles["BodyText"]
        )
    )

    doc.build(elements)

    return filepath