from app.agents.development_execution.code_review_agent import CodeReviewAgent
from app.agents.development_execution.deployment_ready_agent import DeploymentReadyAgent
from app.agents.development_execution.development_agent import DevelopmentAgent
from app.agents.development_execution.integration_test_agent import IntegrationTestAgent
from app.agents.development_execution.source_control_agent import SourceControlAgent
from app.agents.development_execution.unit_test_agent import UnitTestAgent
from app.common.exceptions import AgentNotFoundError
from app.schemas.agent import AgentChatRequest, AgentChatResponse, AgentRunRequest, AgentRunResponse
from app.services.llm_service import generate

DEVELOPMENT_AGENTS = {
    "development": DevelopmentAgent,
    "source_control": SourceControlAgent,
    "unit_test": UnitTestAgent,
    "integration_test": IntegrationTestAgent,
    "code_review": CodeReviewAgent,
    "deployment_ready": DeploymentReadyAgent,
}


def run_agent(payload: AgentRunRequest) -> AgentRunResponse:
    agent_type = DEVELOPMENT_AGENTS.get(payload.agent)
    if not agent_type:
        raise AgentNotFoundError(payload.agent)

    agent = agent_type()
    llm = generate(f"[{agent.name}] {payload.action}: {payload.prompt}\nContext: {payload.context}")
    return AgentRunResponse(
        agent=agent.name,
        action=payload.action,
        status="completed",
        result=llm.text,
        provider=llm.provider,
        model=llm.model,
        fallback=llm.fallback,
        context=payload.context,
    )


def chat(payload: AgentChatRequest) -> AgentChatResponse:
    agent_type = DEVELOPMENT_AGENTS.get(payload.agent)
    if not agent_type:
        raise AgentNotFoundError(payload.agent)
    return AgentChatResponse(**agent_type().run(payload.message, payload.context))
