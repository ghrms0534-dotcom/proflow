import sqlite3

from app.core import auth

AGENT_DEFINITIONS = [
    ("project_control", "Project Control Agent", "project_control", "통합 대시보드", "프로젝트 전체 상태, 위험과 다음 액션을 분석합니다.", "active", 10),
    ("planning_analysis", "Planning Analysis Agent", "planning_analysis", "분석 · 설계", "분석·설계 하위 Agent 상태를 통합합니다.", "skeleton", 20),
    ("requirement", "Requirement Agent", "planning_analysis", "분석 · 설계", "요구사항 상태와 누락 항목을 분석합니다.", "skeleton", 21),
    ("schedule", "Schedule Agent", "planning_analysis", "분석 · 설계", "일정 배정과 지연 가능성을 분석합니다.", "skeleton", 22),
    ("wbs", "WBS Agent", "planning_analysis", "분석 · 설계", "WBS 구성과 진행 상태를 분석합니다.", "skeleton", 23),
    ("ui_design", "UI Design Agent", "planning_analysis", "분석 · 설계", "화면 설계 상태를 분석합니다.", "skeleton", 24),
    ("database_design", "Database Design Agent", "planning_analysis", "분석 · 설계", "데이터베이스 설계 상태를 분석합니다.", "skeleton", 25),
    ("api_design", "API Design Agent", "planning_analysis", "분석 · 설계", "API 설계 상태를 분석합니다.", "skeleton", 26),
    ("design_output", "Design Output Agent", "planning_analysis", "분석 · 설계", "설계 산출물 상태를 분석합니다.", "skeleton", 27),
    ("development_execution", "Development Execution Agent", "development_execution", "개발 · 테스트", "개발·테스트 하위 Agent 상태를 통합합니다.", "skeleton", 30),
    ("development", "Development Agent", "development_execution", "개발 · 테스트", "개발 작업과 코드 컨텍스트를 분석합니다.", "skeleton", 31),
    ("configuration", "Configuration Agent", "development_execution", "개발 · 테스트", "개발 및 배포 환경 구성을 점검합니다.", "skeleton", 32),
    ("source_management", "Source Management Agent", "development_execution", "개발 · 테스트", "소스와 Legacy Modernization 상태를 분석합니다.", "skeleton", 33),
    ("code_review", "Code Review Agent", "development_execution", "개발 · 테스트", "코드 품질, 보안과 성능 위험을 검토합니다.", "skeleton", 34),
    ("unit_test", "Unit Test Agent", "development_execution", "개발 · 테스트", "단위 테스트 생성과 결과를 분석합니다.", "skeleton", 35),
    ("integration_test", "Integration Test Agent", "development_execution", "개발 · 테스트", "API 통합 흐름과 실패 구간을 분석합니다.", "skeleton", 36),
    ("delivery", "Delivery Agent", "delivery", "검증 · 품질", "검증·품질 하위 Agent 상태를 통합합니다.", "skeleton", 40),
    ("quality", "Quality Agent", "delivery", "검증 · 품질", "코드 품질 지표와 Gate를 분석합니다.", "skeleton", 41),
    ("defect", "Defect Agent", "delivery", "검증 · 품질", "결함 상태와 조치 우선순위를 분석합니다.", "skeleton", 42),
    ("document", "Document Agent", "delivery", "검증 · 품질", "문서 완성도와 누락 항목을 분석합니다.", "skeleton", 43),
    ("delivery_output", "Delivery Output Agent", "delivery", "검증 · 품질", "최종 검증 산출물 상태를 분석합니다.", "skeleton", 44),
    ("system_control", "System Control Agent", "system_control", "시스템 관리", "시스템 관리 하위 Agent 상태를 통합합니다.", "skeleton", 50),
    ("access_control", "Access Control Agent", "system_control", "시스템 관리", "사용자 접근 권한 상태를 점검합니다.", "skeleton", 51),
    ("model_config", "Model Config Agent", "system_control", "시스템 관리", "AI 모델 설정 상태를 점검합니다.", "skeleton", 52),
    ("project_config", "Project Config Agent", "system_control", "시스템 관리", "프로젝트 구성 상태를 점검합니다.", "skeleton", 53),
]


def seed(db: sqlite3.Connection) -> None:
    user = db.execute("SELECT * FROM users WHERE email = ?", ("demo@example.com",)).fetchone()
    if not user:
        cursor = db.execute(
            "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)",
            ("demo@example.com", auth.get_password_hash("1234"), "Demo User", "PM/PA"),
        )
        user_id = cursor.lastrowid
    else:
        user_id = user["id"]

    projects = [
        ("Finance Integration Platform", "Active", "2026-01-01", "2026-12-31"),
        ("Internal Workflow Automation", "Active", "2026-03-01", "2026-09-30"),
        ("Data Analytics Portal", "Planning", "2026-06-01", "2027-02-28"),
    ]

    for name, status, start_date, end_date in projects:
        project = db.execute("SELECT * FROM projects WHERE name = ?", (name,)).fetchone()
        if not project:
            cursor = db.execute(
                "INSERT INTO projects (name, description, status, start_date, end_date) VALUES (?, ?, ?, ?, ?)",
                (name, "MVP demo project", status, start_date, end_date),
            )
            project_id = cursor.lastrowid
        else:
            project_id = project["id"]

        db.execute(
            "INSERT OR IGNORE INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)",
            (project_id, user_id, "PM"),
        )
        if not db.execute("SELECT 1 FROM activity_logs WHERE project_id = ?", (project_id,)).fetchone():
            db.execute(
                "INSERT INTO activity_logs (project_id, message, type) VALUES (?, ?, ?)",
                (project_id, f"{name} created", "System"),
            )

    db.executemany(
        """
        INSERT OR IGNORE INTO agent_definitions
        (agent_key, agent_name, section_key, section_name, description, status, sort_order, enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        """,
        AGENT_DEFINITIONS,
    )

    project_one = db.execute("SELECT id FROM projects WHERE id = 1").fetchone()
    if project_one:
        db.execute("INSERT OR IGNORE INTO project_members (project_id, user_id, role) VALUES (1, ?, 'PM')", (user_id,))
        db.execute("INSERT OR IGNORE INTO requirements (project_id, requirement_key, title, status, priority, owner) VALUES (1, 'REQ-001', '사용자 로그인 및 권한 검증', 'approved', 'HIGH', '김영희')")
        db.execute("INSERT OR IGNORE INTO requirements (project_id, requirement_key, title, status, priority, owner) VALUES (1, 'REQ-002', '프로젝트 상태 통합 조회', 'in_review', 'HIGH', '박민지')")
        db.execute("INSERT OR IGNORE INTO development_tasks (project_id, task_key, title, status, priority, owner) VALUES (1, 'DEV-001', 'Agent Chat API 구현', 'in_progress', 'HIGH', '이철수')")
        db.execute("INSERT OR IGNORE INTO development_tasks (project_id, task_key, title, status, priority, owner) VALUES (1, 'DEV-002', 'Project Control context 연결', 'done', 'MEDIUM', '최지훈')")
        db.execute("INSERT OR IGNORE INTO quality_results (project_id, result_key, title, status, score, risk_level) VALUES (1, 'QA-001', 'Backend API 품질 검증', 'passed', 86, 'SAFE')")
        db.execute("INSERT OR IGNORE INTO schedules (project_id, schedule_key, title, status, priority, owner) VALUES (1, 'SCH-001', '분석 설계 기준 일정', 'in_progress', 'HIGH', 'PM')")
        db.execute("INSERT OR IGNORE INTO wbs_items (project_id, wbs_key, title, status, priority, owner) VALUES (1, 'WBS-001', '핵심 기능 작업 분해', 'approved', 'HIGH', 'PL')")
        db.execute("INSERT OR IGNORE INTO ui_designs (project_id, design_key, title, status, priority, owner) VALUES (1, 'UI-001', '프로젝트 대시보드 화면 설계', 'in_review', 'MEDIUM', 'UX')")
        db.execute("INSERT OR IGNORE INTO database_designs (project_id, design_key, title, status, priority, owner) VALUES (1, 'DB-001', '프로젝트 업무 데이터 모델', 'approved', 'HIGH', 'DBA')")
        db.execute("INSERT OR IGNORE INTO api_designs (project_id, design_key, title, status, priority, owner) VALUES (1, 'API-001', '프로젝트 업무 API 명세', 'in_progress', 'HIGH', 'Backend')")
        if not db.execute("SELECT 1 FROM unit_tests WHERE project_id = 1 AND title = '인증 모듈 단위 테스트'").fetchone():
            db.execute("INSERT INTO unit_tests (project_id, title, target_module, status, pass_count, fail_count, coverage, owner) VALUES (1, '인증 모듈 단위 테스트', 'auth', 'completed', 18, 0, 86, 'Backend')")
        if not db.execute("SELECT 1 FROM integration_tests WHERE project_id = 1 AND title = '로그인 API 통합 테스트'").fetchone():
            db.execute("INSERT INTO integration_tests (project_id, title, target_scope, status, scenario_count, passed_scenarios, failed_scenarios, owner) VALUES (1, '로그인 API 통합 테스트', 'auth flow', 'in_progress', 8, 6, 2, 'QA')")
        if not db.execute("SELECT 1 FROM code_reviews WHERE project_id = 1 AND title = 'Project API 코드 리뷰'").fetchone():
            db.execute("INSERT INTO code_reviews (project_id, title, repository, branch, reviewer, status, issue_count, resolved_count) VALUES (1, 'Project API 코드 리뷰', 'proflow', 'main', 'PL', 'in_review', 4, 2)")
        if not db.execute("SELECT 1 FROM deployments WHERE project_id = 1 AND title = '개발 환경 배포'").fetchone():
            db.execute("INSERT INTO deployments (project_id, title, environment, version, status, owner) VALUES (1, '개발 환경 배포', 'development', '0.1.0', 'completed', 'DevOps')")
        if not db.execute("SELECT 1 FROM defects WHERE project_id = 1 AND title = '로그인 예외 처리 누락'").fetchone():
            db.execute("INSERT INTO defects (project_id, title, severity, status, source, owner, detected_at) VALUES (1, '로그인 예외 처리 누락', 'HIGH', 'open', 'Code Review', 'Backend', '2026-07-01')")
        if not db.execute("SELECT 1 FROM documents WHERE project_id = 1 AND title = 'API 명세서'").fetchone():
            db.execute("INSERT INTO documents (project_id, title, document_type, version, status, owner, file_name, file_path) VALUES (1, 'API 명세서', 'API', '1.0', 'in_review', 'PL', 'api-spec.md', '/docs/api-spec.md')")
        if not db.execute("SELECT 1 FROM outputs WHERE project_id = 1 AND title = '1차 검증 보고서'").fetchone():
            db.execute("INSERT INTO outputs (project_id, title, output_type, version, status, owner, submitted_at) VALUES (1, '1차 검증 보고서', 'Verification Report', '1.0', 'submitted', 'QA', '2026-07-01')")
        if not db.execute("SELECT 1 FROM activity_logs WHERE project_id = 1 AND message = 'Project Control Agent context seeded'").fetchone():
            db.execute("INSERT INTO activity_logs (project_id, message, type) VALUES (1, 'Project Control Agent context seeded', 'Agent')")
        if not db.execute("SELECT 1 FROM agent_runs WHERE project_id = 1 AND agent_name = 'Project Control Agent' AND request_json LIKE '%seed%'").fetchone():
            db.execute(
                """
                INSERT INTO agent_runs (project_id, agent_name, request_json, response_json, provider, model, mock, fallback)
                VALUES (1, 'Project Control Agent', '{"source":"seed"}', '{"summary":"Initial project context ready"}', 'mock', 'gemma4:31b', 1, 0)
                """
            )

    db.commit()
