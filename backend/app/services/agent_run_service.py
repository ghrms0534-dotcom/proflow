from contextlib import closing

from app.agents.development_execution.code_review_agent import CodeReviewAgent
from app.agents.development_execution.deployment_ready_agent import DeploymentReadyAgent
from app.agents.development_execution.development_agent import DevelopmentAgent
from app.agents.development_execution.integration_test_agent import IntegrationTestAgent
from app.agents.development_execution.source_control_agent import SourceControlAgent
from app.agents.development_execution.unit_test_agent import UnitTestAgent
from app.agents.project_control.project_control_agent import ProjectControlAgent
from app.common import database
from app.common.config import LLM_REQUEST_TIMEOUT, OLLAMA_MODEL, USE_REAL_LLM
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
DEVELOPMENT_PROMPTS = {
    "development": "개발 작업 목록, 구현 순서, 주요 로직과 산출 코드 구조를 제안하세요.",
    "configuration": "브랜치 전략, 환경 설정과 빌드/배포 설정을 제안하세요.",
    "source_management": "커밋 단위, 변경 파일 구조와 merge 전략을 제안하세요.",
    "code_review": "코드 리뷰 체크리스트, 위험 코드와 개선 포인트를 제안하세요.",
    "unit_test": "단위 테스트 케이스, mock 대상과 기대 결과를 생성하세요.",
    "integration_test": "통합 테스트 시나리오, API 흐름과 데이터 검증 케이스를 생성하세요.",
}
DELIVERY_PROMPTS = {
    "quality": "품질 기준, 검증 체크리스트, 누락 위험과 승인 기준을 생성하세요.",
    "defect": "결함 후보, 심각도, 원인, 조치 방안과 재현 조건을 생성하세요.",
    "document": "사용자 문서, 운영 문서와 개발 문서의 초안을 생성하세요.",
    "delivery_output": "최종 산출물 목록, 제출 상태와 릴리즈 체크리스트를 생성하세요.",
}
SYSTEM_PROMPTS = {
    "access_control": "사용자 역할, 권한 정책과 접근 제어 점검안을 생성하세요. 실제 계정이나 권한은 변경하지 마세요.",
    "model_config": "LLM provider, model, timeout과 context 설정을 점검하고 추천안을 생성하세요. 실제 설정은 변경하지 마세요.",
    "project_config": "프로젝트 기본 설정, lifecycle 기준과 Agent 활성화 정책을 생성하세요. 실제 설정은 변경하지 마세요.",
}
AGENT_PROMPTS = {**PLANNING_PROMPTS, **DEVELOPMENT_PROMPTS, **DELIVERY_PROMPTS, **SYSTEM_PROMPTS}


PLANNING_AGENT_TYPES = tuple(PLANNING_PROMPTS)
DEVELOPMENT_AGENT_TYPES = tuple(DEVELOPMENT_PROMPTS)
DELIVERY_AGENT_TYPES = tuple(DELIVERY_PROMPTS)
SYSTEM_AGENT_TYPES = tuple(SYSTEM_PROMPTS)
ALL_AGENT_TYPES = (*PLANNING_AGENT_TYPES, *DEVELOPMENT_AGENT_TYPES, *DELIVERY_AGENT_TYPES, *SYSTEM_AGENT_TYPES)
CONTEXT_DEPENDENCIES = {
    "requirement": (),
    "schedule": ("requirement",),
    "wbs": ("requirement", "schedule"),
    "ui_design": ("requirement", "wbs"),
    "database_design": ("requirement", "api_design", "ui_design"),
    "api_design": ("requirement", "database_design"),
    "development": ("requirement", "wbs", "api_design", "database_design"),
    "configuration": ("project_config", "wbs", "development"),
    "source_management": ("development", "configuration"),
    "code_review": ("development", "source_management"),
    "unit_test": ("requirement", "api_design", "development"),
    "integration_test": ("requirement", "api_design", "database_design", "unit_test"),
    "quality": ("requirement", "api_design", "database_design", "development", "unit_test", "integration_test"),
    "defect": ("quality", "unit_test", "integration_test", "code_review"),
    "document": ("requirement", "ui_design", "api_design", "database_design", "development"),
    "delivery_output": ("requirement", "wbs", "development", "quality", "defect", "document"),
    "access_control": ("access_summary",),
    "model_config": ("llm_config",),
    "project_config": ("project_config", "lifecycle_summary"),
}


def get_agent_context(project_id: int, user_id: int) -> dict:
    with closing(database.connect()) as db:
        if not db.execute("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?", (project_id, user_id)).fetchone():
            raise ProjectAccessError("Project access denied")
        project = db.execute("SELECT id, name, description, status, start_date, end_date FROM projects WHERE id = ?", (project_id,)).fetchone()
        roles = {row["role"]: row["count"] for row in db.execute("SELECT role, COUNT(*) AS count FROM users GROUP BY role").fetchall()}
        enabled_agents = db.execute("SELECT COUNT(*) FROM agent_definitions WHERE enabled = 1").fetchone()[0]
        rows = db.execute(
            f"SELECT id, agent_name, output_result, summary, status, provider, model, fallback, created_at FROM agent_runs WHERE project_id = ? AND agent_name IN ({','.join('?' for _ in ALL_AGENT_TYPES)}) ORDER BY id DESC",
            (project_id, *ALL_AGENT_TYPES),
        ).fetchall()
    latest = {}
    for row in rows:
        if row["agent_name"] not in latest:
            latest[row["agent_name"]] = {
                "id": row["id"], "agent_type": row["agent_name"], "summary": row["summary"] or row["output_result"][:300],
                "output_text": row["output_result"], "status": row["status"], "provider": row["provider"],
                "model": row["model"], "fallback": bool(row["fallback"]), "created_at": row["created_at"],
            }
    def progress(types):
        items = [latest[name] for name in types if name in latest]
        completed = sum(item["status"] == "success" for item in items)
        newest = max(items, key=lambda item: item["id"], default=None)
        return {"completed_count": completed, "total_count": len(types), "progress": round(completed / len(types) * 100),
                "latest_agent": newest["agent_type"] if newest else None, "last_run_at": newest["created_at"] if newest else None,
                "has_failure": any(item["status"] != "success" for item in items)}
    settings = {"access_summary": {"roles": roles}, "llm_config": {"provider": "ollama", "model": OLLAMA_MODEL,
                "timeout": LLM_REQUEST_TIMEOUT, "enabled": USE_REAL_LLM}, "enabled_agents": enabled_agents}
    return {"project_id": project_id, "project": dict(project), "settings": settings, "agents": latest,
            "planning": progress(PLANNING_AGENT_TYPES), "development": progress(DEVELOPMENT_AGENT_TYPES),
            "delivery": progress(DELIVERY_AGENT_TYPES), "system": progress(SYSTEM_AGENT_TYPES), "lifecycle": progress(ALL_AGENT_TYPES)}


def run_agent(payload: AgentRunRequest, user_id: int) -> AgentRunResponse:
    project_context = get_agent_context(payload.project_id, user_id)
    # ponytail: latest full outputs are enough for this 19-agent scope; use summaries/token limits if prompts approach the model context window.
    special_context = {"project_config": project_context["project"], "lifecycle_summary": project_context["lifecycle"],
                       **project_context["settings"]}
    dependencies = {name: special_context[name] if name in special_context else project_context["agents"][name]["output_text"]
                    for name in CONTEXT_DEPENDENCIES[payload.agent_type] if name in special_context or name in project_context["agents"]}
    with closing(database.connect()) as db:
        if not db.execute("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?", (payload.project_id, user_id)).fetchone():
            raise ProjectAccessError("Project access denied")

    prompt = f"{AGENT_PROMPTS[payload.agent_type]}\n\n사용자 요청:\n{payload.user_input}\n\n추가 컨텍스트:\n{payload.context}"
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
