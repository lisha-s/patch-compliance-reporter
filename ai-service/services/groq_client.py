import os
import time
import requests
from dotenv import load_dotenv
from config import Config

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def generate_ai_response(prompt, retries=3):

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": Config.GROQ_MODEL,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": Config.TEMPERATURE,
        "max_tokens": Config.MAX_TOKENS
    }

    for attempt in range(retries):

        try:

            response = requests.post(
                GROQ_URL,
                headers=headers,
                json=payload,
                timeout=30
            )

            response.raise_for_status()

            data = response.json()

            return data["choices"][0]["message"]["content"]

        except Exception as error:

            print(f"Attempt {attempt + 1} failed:", error)

            time.sleep(2)

    return None