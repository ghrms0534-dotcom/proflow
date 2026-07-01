import json
import logging
import socket
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.common.config import LLM_REQUEST_TIMEOUT, OLLAMA_BASE_URL, OLLAMA_MODEL, USE_REAL_LLM

LOGGER = logging.getLogger("uvicorn.error")
PROVIDER = "ollama"
RESPONSE_PREVIEW_LENGTH = 500


@dataclass(frozen=True)
class LlmResult:
    text: str
    provider: str
    model: str
    fallback: bool


def generate(prompt: str) -> LlmResult:
    if not USE_REAL_LLM:
        return _mock_result(prompt, fallback=False)

    endpoint = f"{OLLAMA_BASE_URL}/api/generate"
    LOGGER.info(
        "[LLM REQUEST] provider=%s base_url=%s model=%s endpoint=%s prompt_length=%d timeout=%ss",
        PROVIDER,
        OLLAMA_BASE_URL,
        OLLAMA_MODEL,
        endpoint,
        len(prompt),
        LLM_REQUEST_TIMEOUT,
    )
    request = Request(
        endpoint,
        data=json.dumps({"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=LLM_REQUEST_TIMEOUT) as response:
            body = response.read().decode(errors="replace")
            LOGGER.info(
                "[LLM RESPONSE] status=%s body_preview=%r",
                getattr(response, "status", None),
                body[:RESPONSE_PREVIEW_LENGTH],
            )
            text = _parse_response(body)
            return LlmResult(text=text, provider=PROVIDER, model=OLLAMA_MODEL, fallback=False)
    except HTTPError as error:
        body = error.read().decode(errors="replace") if error.fp else ""
        LOGGER.exception("[LLM ERROR] %s status=%s body_preview=%r", _error_reason(error, body), error.code, body[:RESPONSE_PREVIEW_LENGTH])
        return _mock_result(prompt, fallback=True)
    except (OSError, ValueError) as error:
        LOGGER.exception("[LLM ERROR] %s", _error_reason(error))
        return _mock_result(prompt, fallback=True)


def _parse_response(body: str) -> str:
    try:
        data = json.loads(body)
    except json.JSONDecodeError as error:
        raise ValueError("invalid response format: response is not JSON") from error

    text = data.get("response")
    if not text and isinstance(data.get("message"), dict):
        text = data["message"].get("content")
    if not isinstance(text, str) or not text.strip():
        raise ValueError("invalid response format: missing response or message.content")
    return text.strip()


def _error_reason(error: Exception, body: str = "") -> str:
    detail = f"{error} {body}".lower()
    reason = getattr(error, "reason", None)
    if "model" in detail and "not found" in detail:
        return "model not found"
    if isinstance(error, (TimeoutError, socket.timeout)) or "timed out" in detail:
        return "timeout"
    if isinstance(reason, ConnectionRefusedError) or "connection refused" in detail:
        return "connection refused"
    if isinstance(error, ValueError):
        return "invalid response format"
    if isinstance(error, HTTPError):
        return f"HTTP {error.code}"
    if isinstance(error, URLError):
        return f"connection error: {reason}"
    return f"{type(error).__name__}: {error}"


def _mock_result(prompt: str, fallback: bool) -> LlmResult:
    summary = prompt.strip().replace("\n", " ")[:120]
    return LlmResult(
        text=f"Mock Development Agent analysis completed: {summary}",
        provider="mock",
        model=OLLAMA_MODEL,
        fallback=fallback,
    )
