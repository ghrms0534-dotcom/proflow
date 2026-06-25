from dataclasses import dataclass

from .agent_types import RiskLevel


@dataclass
class AgentMemory:
    agent_name: str
    last_risk_level: RiskLevel | None = None
    last_summary: str | None = None
    updated_at: str | None = None
