import json

try:
    import redis

    redis_client = redis.Redis(
        host="localhost",
        port=6379,
        decode_responses=True
    )

    redis_client.ping()

    REDIS_AVAILABLE = True

except Exception:

    REDIS_AVAILABLE = False


def get_cached_response(key):

    if not REDIS_AVAILABLE:
        return None

    data = redis_client.get(key)

    if data:
        return json.loads(data)

    return None


def set_cached_response(key, value, expiry=3600):

    if not REDIS_AVAILABLE:
        return

    redis_client.setex(
        key,
        expiry,
        json.dumps(value)
    )