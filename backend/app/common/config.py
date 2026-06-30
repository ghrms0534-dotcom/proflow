import os

USE_REAL_LLM = os.getenv("USE_REAL_LLM", "false").lower() in {"1", "true", "yes", "on"}
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")
