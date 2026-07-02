from typing import Any, Literal

from pydantic import BaseModel, Field

AgentType = Literal[
    "requirement", "schedule", "wbs", "ui_design", "database_design", "api_design",
    "development", "configuration", "source_management", "code_review", "unit_test", "integration_test",
    "quality", "defect", "document", "delivery_output",
]


class AgentRunRequest(BaseModel):
    project_id: int = Field(gt=0)
    agent_type: AgentType
    user_input: str = Field(min_length=1, max_length=10000)
    context: dict[str, Any] = Field(default_factory=dict)


class AgentRunSummary(BaseModel):
    id: int
    agent_type: str
    result: str
    provider: str
    model: str
    fallback: bool
    created_at: str


class AgentRunResponse(BaseModel):
    run_id: int
    agent_type: AgentType
    status: str
    result: str
    provider: str
    model: str
    fallback: bool
    recent_runs: list[AgentRunSummary]


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
