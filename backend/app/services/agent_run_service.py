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

PLANNING_PROMPTS = {
    "requirement": "요구사항을 정리하고 기능 요구사항, 비기능 요구사항, acceptance criteria를 구분해 작성하세요.",
    "schedule": "실행 가능한 일정 초안과 milestone, 일정 risk 및 대응 방안을 작성하세요.",
    "wbs": "작업분해구조(WBS)를 만들고 각 작업의 담당 역할과 선후행 관계를 작성하세요.",
    "ui_design": "화면 구성, 주요 UI 컴포넌트와 사용자 흐름을 작성하세요.",
    "database_design": "테이블 후보, 주요 컬럼, 관계와 제약조건을 작성하세요.",
    "api_design": "endpoint, HTTP method, request/response와 validation 규칙을 작성하세요.",
}


PLANNING_AGENT_TYPES = tuple(PLANNING_PROMPTS)
CONTEXT_DEPENDENCIES = {
    "requirement": (),
    "schedule": ("requirement",),
    "wbs": ("requirement", "schedule"),
    "ui_design": ("requirement", "wbs"),
    "database_design": ("requirement", "api_design", "ui_design"),
    "api_design": ("requirement", "database_design"),
}


def get_agent_context(project_id: int, user_id: int) -> dict:
    with closing(database.connect()) as db:
        if not db.execute("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?", (project_id, user_id)).fetchone():
            raise ProjectAccessError("Project access denied")
        rows = db.execute(
            f"SELECT id, agent_name, output_result, summary, status, provider, model, fallback, created_at FROM agent_runs WHERE project_id = ? AND agent_name IN ({','.join('?' for _ in PLANNING_AGENT_TYPES)}) ORDER BY id DESC",
            (project_id, *PLANNING_AGENT_TYPES),
        ).fetchall()
    latest = {}
    for row in rows:
        if row["agent_name"] not in latest:
            latest[row["agent_name"]] = {
                "id": row["id"], "agent_type": row["agent_name"], "summary": row["summary"] or row["output_result"][:300],
                "output_text": row["output_result"], "status": row["status"], "provider": row["provider"],
                "model": row["model"], "fallback": bool(row["fallback"]), "created_at": row["created_at"],
            }
    completed = sum(item["status"] == "success" for item in latest.values())
    newest = next(iter(latest.values()), None)
    return {"project_id": project_id, "agents": latest, "planning": {
        "completed_count": completed, "total_count": len(PLANNING_AGENT_TYPES),
        "progress": round(completed / len(PLANNING_AGENT_TYPES) * 100),
        "latest_agent": newest["agent_type"] if newest else None, "last_run_at": newest["created_at"] if newest else None,
        "has_failure": any(item["status"] != "success" for item in latest.values()),
    }}


def run_agent(payload: AgentRunRequest, user_id: int) -> AgentRunResponse:
    project_context = get_agent_context(payload.project_id, user_id)
    # ponytail: latest full outputs are enough for six planning agents; use summaries/token limits if prompts approach the model context window.
    dependencies = {name: project_context["agents"][name]["output_text"] for name in CONTEXT_DEPENDENCIES[payload.agent_type] if name in project_context["agents"]}
    with closing(database.connect()) as db:
        if not db.execute("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?", (payload.project_id, user_id)).fetchone():
            raise ProjectAccessError("Project access denied")

    prompt = f"{PLANNING_PROMPTS[payload.agent_type]}\n\n사용자 요청:\n{payload.user_input}\n\n추가 컨텍스트:\n{payload.context}"
    prompt += f"\n\nLifecycle context:\n{dependencies}"
    llm = generate(prompt)
    status = "fallback" if llm.fallback else "success"
    summary = llm.text.strip().replace("\n", " ")[:300]
    with closing(database.connect()) as db:
        cursor = db.execute(
            """
            INSERT INTO agent_runs
            (project_id, agent_name, request_json, response_json, provider, model, mock, fallback, input_prompt, output_result, summary, status)
            VALUES (?, ?, ?, '{}', ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (payload.project_id, payload.agent_type, payload.model_dump_json(), llm.provider, llm.model,
             llm.provider == "mock", llm.fallback, prompt, llm.text, summary, status),
        )
        db.execute("INSERT INTO activity_logs (project_id, message, type) VALUES (?, ?, 'Agent')",
                   (payload.project_id, f"{payload.agent_type} lifecycle context: {', '.join(dependencies) or 'standalone'}"))
        db.execute("INSERT INTO activity_logs (project_id, message, type) VALUES (?, ?, 'Agent')",
                   (payload.project_id, f"{payload.agent_type} Agent AI 실행"))
        db.commit()
        rows = db.execute(
            "SELECT id, agent_name, output_result, provider, model, fallback, created_at FROM agent_runs WHERE project_id = ? AND agent_name = ? ORDER BY id DESC LIMIT 5",
            (payload.project_id, payload.agent_type),
        ).fetchall()
    return AgentRunResponse(
        run_id=cursor.lastrowid, agent_type=payload.agent_type, status=status, result=llm.text,
        provider=llm.provider, model=llm.model, fallback=llm.fallback,
        recent_runs=[{"id": row["id"], "agent_type": row["agent_name"], "result": row["output_result"],
                      "provider": row["provider"], "model": row["model"], "fallback": bool(row["fallback"]),
                      "created_at": row["created_at"]} for row in rows],
    )


def chat(payload: AgentChatRequest, user_id: int | None = None) -> AgentChatResponse:
    if payload.agent == "project_control":
        if not payload.project_id:
            raise ValueError("project_id is required for Project Control Agent")
        if not user_id:
            raise ProjectAccessError("Authentication is required for Project Control Agent")
        agent = ProjectControlAgent()
        dashboard_context = agent.build_dashboard_context(payload.project_id, user_id)
        analysis = agent.run(payload.message, dashboard_context)
        prompt = agent.build_prompt(payload.message, dashboard_context)
        llm = generate(prompt)
        response = AgentChatResponse(
            agent=agent.name,
            description=agent.description,
            message=payload.message,
            result=llm.text if llm.provider == "ollama" else agent.render_mock(analysis),
            context={**payload.context, "dashboard_context": dashboard_context},
            mock=llm.provider == "mock",
            provider=llm.provider,
            model=llm.model,
            fallback=llm.fallback,
            analysis=analysis,
        )
        return _save_run(payload, response, payload.project_id, prompt)

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


def _save_run(payload: AgentChatRequest, response: AgentChatResponse, project_id: int | None, input_prompt: str | None = None) -> AgentChatResponse:
    status = "fallback" if response.fallback else "success"
    with closing(database.connect()) as db:
        cursor = db.execute(
            """
            INSERT INTO agent_runs
            (project_id, agent_name, request_json, response_json, provider, model, mock, fallback, input_prompt, output_result, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (project_id, payload.agent, payload.model_dump_json(), response.model_dump_json(), response.provider, response.model, response.mock, response.fallback, input_prompt or payload.message, response.result, status),
        )
        db.commit()
        response.run_id = cursor.lastrowid
        return response
