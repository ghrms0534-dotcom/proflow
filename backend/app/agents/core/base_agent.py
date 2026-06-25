from typing import Protocol

from .agent_types import AgentRequest, AgentResponse


class BaseAgent(Protocol):
    name: str

    def analyze(self, request: AgentRequest) -> AgentResponse:
        ...
