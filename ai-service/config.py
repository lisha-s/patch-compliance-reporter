import os


class Config:

    GROQ_MODEL = os.getenv(
        "GROQ_MODEL",
        "llama-3.3-70b-versatile"
    )

    MAX_TOKENS = int(
        os.getenv("MAX_TOKENS", 300)
    )

    TEMPERATURE = float(
        os.getenv("TEMPERATURE", 0.3)
    )

    CACHE_EXPIRY = int(
        os.getenv("CACHE_EXPIRY", 3600)
    )