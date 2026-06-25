from dataclasses import dataclass, field
from typing import Any, Literal

AnalysisMode = str
RiskLevel = Literal["SAFE", "WARN", "CRITICAL"]


@dataclass
class AgentContext:
    data: Any
    source: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class AgentRequest:
    agent_name: str
    analysis_mode: AnalysisMode
    context: AgentContext


@dataclass
class AgentAction:
    label: str
    target: str | None = None
    disabled: bool = False


@dataclass
class AgentSuggestion:
    title: str
    description: str
    priority: RiskLevel | None = None
    action: AgentAction | None = None


@dataclass
class AgentResponse:
    summary: str
    risk_level: RiskLevel
    detected_issues: list[str]
    root_cause: str
    recommended_actions: list[str]
    popup_insights: list[str]
    confidence: float
    memory_diff: str | None = None
    suggestions: list[AgentSuggestion] = field(default_factory=list)
