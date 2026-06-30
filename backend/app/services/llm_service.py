from dataclasses import dataclass

from app.common.config import OLLAMA_MODEL


@dataclass(frozen=True)
class LlmResult:
    text: str
    provider: str
    model: str
    fallback: bool


def generate(prompt: str) -> LlmResult:
    return _mock_result(prompt)


def _mock_result(prompt: str) -> LlmResult:
    summary = prompt.strip().replace("\n", " ")[:120]
    return LlmResult(
        text=f"Mock Development Agent analysis completed: {summary}",
        provider="mock",
        model=OLLAMA_MODEL,
        fallback=False,
    )
