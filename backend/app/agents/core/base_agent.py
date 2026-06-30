from typing import Any, Protocol

from .agent_types import AgentRequest, AgentResponse


class BaseAgent(Protocol):
    name: str
    description: str

    def run(self, message: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
        ...

    def analyze(self, request: AgentRequest) -> AgentResponse:
        ...


class MockAgent:
    name = "Mock Agent"
    description = "Agent skeleton with a local mock response."

    def run(self, message: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
        return {
            "agent": self.name,
            "description": self.description,
            "message": message,
            "result": f"{self.name} mock response completed.",
            "context": context or {},
            "mock": True,
        }

    def analyze(self, request: AgentRequest) -> AgentResponse:
        return AgentResponse(
            summary=f"{self.name} mock analysis completed for {request.analysis_mode}.",
            risk_level="SAFE",
            detected_issues=[],
            root_cause="Mock execution does not inspect real source code.",
            recommended_actions=["Connect the Development Agent to an LLM runtime."],
            popup_insights=[f"Context source: {request.context.source or 'local mock'}"],
            confidence=0.75,
        )
