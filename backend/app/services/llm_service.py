import json
from dataclasses import dataclass
from urllib.request import Request, urlopen

from app.common.config import OLLAMA_BASE_URL, OLLAMA_MODEL, USE_REAL_LLM


@dataclass(frozen=True)
class LlmResult:
    text: str
    provider: str
    model: str
    fallback: bool


def generate(prompt: str) -> LlmResult:
    if not USE_REAL_LLM:
        return _mock_result(prompt, fallback=False)

    request = Request(
        f"{OLLAMA_BASE_URL}/api/generate",
        data=json.dumps({"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=15) as response:
            text = json.loads(response.read().decode()).get("response", "").strip()
            if not text:
                raise ValueError("Ollama returned an empty response")
            return LlmResult(text=text, provider="ollama", model=OLLAMA_MODEL, fallback=False)
    except (OSError, ValueError):
        return _mock_result(prompt, fallback=True)


def _mock_result(prompt: str, fallback: bool) -> LlmResult:
    summary = prompt.strip().replace("\n", " ")[:120]
    return LlmResult(
        text=f"Mock Development Agent analysis completed: {summary}",
        provider="mock",
        model=OLLAMA_MODEL,
        fallback=fallback,
    )
