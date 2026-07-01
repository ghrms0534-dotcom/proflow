import json
from contextlib import closing

from app.agents.development_execution.code_review_agent import CodeReviewAgent
from app.agents.development_execution.deployment_ready_agent import DeploymentReadyAgent
from app.agents.development_execution.development_agent import DevelopmentAgent
from app.agents.development_execution.integration_test_agent import IntegrationTestAgent
from app.agents.development_execution.source_control_agent import SourceControlAgent
from app.agents.development_execution.unit_test_agent import UnitTestAgent
from app.agents.project_control.project_control_agent import ProjectControlAgent
from app.common import database
from app.common.config import OLLAMA_MODEL
from app.common.exceptions import AgentNotFoundError, ProjectAccessError
from app.schemas.agent import AgentChatRequest, AgentChatResponse, AgentRunRequest, AgentRunResponse
from app.services.llm_service import generate
from app.services.agent_definition_service import get_agent

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


def chat(payload: AgentChatRequest, user_id: int | None = None) -> AgentChatResponse:
    if payload.agent == "project_control":
        if not payload.project_id:
            raise ValueError("project_id is required for Project Control Agent")
        if not user_id:
            raise ProjectAccessError("Authentication is required for Project Control Agent")
        agent = ProjectControlAgent()
        analysis = agent.run(payload.message, agent.build_context(payload.project_id, user_id))
        llm = generate(f"[{agent.name}] {payload.message}\nProject context: {json.dumps(analysis, ensure_ascii=False, default=str)}")
        response = AgentChatResponse(
            agent=agent.name,
            description=agent.description,
            message=payload.message,
            result=llm.text if llm.provider == "ollama" else agent.render_mock(analysis),
            context=payload.context,
            mock=llm.provider == "mock",
            provider=llm.provider,
            model=llm.model,
            fallback=llm.fallback,
            analysis=analysis,
        )
        return _save_run(payload, response, payload.project_id)

    definition = get_agent(payload.agent)
    if definition:
        response = AgentChatResponse(
            agent=definition["agent_name"],
            description=definition["description"],
            message=payload.message,
            result=f"{definition['agent_name']}는 현재 {definition['status']} 상태입니다. {definition['description']}",
            context=payload.context,
            mock=True,
            provider="mock",
            model=OLLAMA_MODEL,
            fallback=False,
            analysis={"agent_key": definition["agent_key"], "section_key": definition["section_key"], "status": definition["status"]},
        )
        return _save_run(payload, response, None)

    agent_type = DEVELOPMENT_AGENTS.get(payload.agent)
    if not agent_type:
        raise AgentNotFoundError(payload.agent)
    agent = agent_type()
    llm = generate(f"[{agent.name}] {payload.message}\nContext: {payload.context}")
    response = AgentChatResponse(
        agent=agent.name,
        description=agent.description,
        message=payload.message,
        result=llm.text,
        context=payload.context,
        mock=llm.provider == "mock",
        provider=llm.provider,
        model=llm.model,
        fallback=llm.fallback,
    )
    return _save_run(payload, response, None)


def _save_run(payload: AgentChatRequest, response: AgentChatResponse, project_id: int | None) -> AgentChatResponse:
    with closing(database.connect()) as db:
        cursor = db.execute(
            """
            INSERT INTO agent_runs (project_id, agent_name, request_json, response_json, provider, model, mock, fallback)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (project_id, response.agent, payload.model_dump_json(), response.model_dump_json(), response.provider, response.model, response.mock, response.fallback),
        )
        db.commit()
        response.run_id = cursor.lastrowid
        return response
