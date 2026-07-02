import os
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).parents[2] / ".env")


def _positive_int(name: str, default: int) -> int:
    try:
        value = int(os.getenv(name, str(default)))
        return value if value > 0 else default
    except ValueError:
        return default


USE_REAL_LLM = os.getenv("USE_REAL_LLM", "true").lower() in {"1", "true", "yes", "on"}
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
LLM_REQUEST_TIMEOUT = _positive_int("LLM_REQUEST_TIMEOUT", 60)
