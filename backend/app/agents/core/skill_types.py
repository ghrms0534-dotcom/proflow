from dataclasses import dataclass
from typing import Callable

from .agent_types import AgentContext, AgentResponse, AnalysisMode


@dataclass
class AgentSkill:
    name: str
    analysis_mode: AnalysisMode
    run: Callable[[AgentContext], AgentResponse]
