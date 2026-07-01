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
    agent: str = Field(default="development", min_length=2, max_length=64, pattern=r"^[a-z0-9_]+$")
    message: str = Field(min_length=1)
    project_id: int | None = Field(default=None, gt=0)
    context: dict[str, Any] = Field(default_factory=dict)


class AgentChatResponse(BaseModel):
    agent: str
    description: str
    message: str
    result: str
    context: dict[str, Any]
    mock: bool
    provider: str
    model: str
    fallback: bool
    analysis: dict[str, Any] | None = None
    run_id: int | None = None


class AgentDefinitionResponse(BaseModel):
    id: int
    agent_key: str
    agent_name: str
    section_key: str
    section_name: str
    description: str
    status: str
    sort_order: int
    enabled: bool
    created_at: str
