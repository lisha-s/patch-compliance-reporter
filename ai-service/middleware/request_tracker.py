import uuid

from flask import g


def assign_request_id():

    g.request_id = str(
        uuid.uuid4()
    )