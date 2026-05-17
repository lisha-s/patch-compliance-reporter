import csv
import os


def export_ai_requests(
    rows
):

    if not os.path.exists(
        "exports"
    ):
        os.makedirs(
            "exports"
        )

    file_path = (
        "exports/ai_requests.csv"
    )

    with open(
        file_path,
        mode="w",
        newline="",
        encoding="utf-8"
    ) as csv_file:

        writer = csv.writer(
            csv_file
        )

        writer.writerow([
            "ID",
            "API Name",
            "Software",
            "Patch Status",
            "Response",
            "Created At"
        ])

        for row in rows:

            writer.writerow([
                row["id"],
                row["api_name"],
                row["software"],
                row["patch_status"],
                row["response"],
                row["created_at"]
            ])

    return file_path