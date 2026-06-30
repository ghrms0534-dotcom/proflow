from typing import Any, Literal

from pydantic import BaseModel, Field

DevelopmentAgentName = Literal[
    "development",
    "source_control",
    "unit_test",
    "integration_test",
    "code_review",
    "deployment_ready",
]


class AgentRunRequest(BaseModel):
    agent: DevelopmentAgentName = "development"
    action: str = "analyze"
    prompt: str = "Analyze the current development task."
    context: dict[str, Any] = Field(default_factory=dict)


class AgentRunResponse(BaseModel):
    agent: str
    action: str
    status: str
    result: str
    provider: str
    model: str
    fallback: bool
    context: dict[str, Any]


class AgentChatRequest(BaseModel):
    agent: DevelopmentAgentName = "development"
    message: str
    context: dict[str, Any] = Field(default_factory=dict)


class AgentChatResponse(BaseModel):
    agent: str
    description: str
    message: str
    result: str
    context: dict[str, Any]
    mock: bool
