import json
import unittest
from contextlib import closing
from pathlib import Path
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.common import config, database
from app.db.seed import seed
from app.schemas.agent import AgentChatRequest
from app.services import llm_service
from app.services.agent_run_service import chat
from main import app


class AgentRunServiceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.original_db_path = database.DB_PATH
        cls.test_db_path = Path(__file__).with_name("test_agent.db")
        database.DB_PATH = cls.test_db_path
        database.init_db()
        with closing(database.connect()) as db:
            seed(db)

    @classmethod
    def tearDownClass(cls):
        database.DB_PATH = cls.original_db_path

    def test_invalid_llm_timeout_uses_default(self):
        with patch.dict("os.environ", {"TEST_LLM_TIMEOUT": "invalid"}):
            self.assertEqual(config._positive_int("TEST_LLM_TIMEOUT", 60), 60)

    def test_planning_agent_run_uses_prompts_and_saves_history(self):
        with TestClient(app) as client:
            login = client.post("/api/auth/login", json={"email": "demo@example.com", "password": "1234"})
            headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
            prompts = {
                "requirement": "acceptance criteria", "schedule": "milestone", "wbs": "선후행 관계",
                "ui_design": "사용자 흐름", "database_design": "제약조건", "api_design": "validation",
            }
            with patch("app.services.agent_run_service.generate", return_value=llm_service.LlmResult("AI result", "mock", "qwen2.5:3b", False)) as generate:
                for agent_type, expected in prompts.items():
                    response = client.post("/api/agents/run", headers=headers, json={
                        "project_id": 1, "agent_type": agent_type, "user_input": "초안을 작성해줘", "context": {"source": "test"},
                    })
                    self.assertEqual(response.status_code, 200, response.text)
                    self.assertIn(expected, generate.call_args.args[0])

            result = response.json()
            self.assertEqual(result["agent_type"], "api_design")
            self.assertEqual(result["result"], "AI result")
            self.assertLessEqual(len(result["recent_runs"]), 5)
            with closing(database.connect()) as db:
                self.assertEqual(db.execute("SELECT COUNT(*) FROM agent_runs WHERE project_id = 1 AND agent_name IN ('requirement','schedule','wbs','ui_design','database_design','api_design')").fetchone()[0], 6)
                self.assertEqual(db.execute("SELECT COUNT(*) FROM activity_logs WHERE project_id = 1 AND message LIKE '%Agent AI%'").fetchone()[0], 6)

    @patch("app.services.llm_service.USE_REAL_LLM", False)
    def test_development_agent_returns_mock_response(self):
        result = chat(AgentChatRequest(message="Review auth.py", context={"file": "auth.py"}))

        self.assertEqual(result.agent, "Development Agent")
        self.assertTrue(result.mock)
        self.assertFalse(result.fallback)
        self.assertEqual(result.provider, "mock")

    @patch("app.services.llm_service.OLLAMA_BASE_URL", "http://127.0.0.1:1")
    @patch("app.services.llm_service.USE_REAL_LLM", True)
    def test_ollama_failure_falls_back_to_mock(self):
        result = llm_service.generate("fallback check")

        self.assertEqual(result.provider, "mock")
        self.assertTrue(result.fallback)

    @patch("app.services.llm_service.USE_REAL_LLM", True)
    def test_real_llm_uses_ollama_response(self):
        response = MagicMock()
        response.status = 200
        response.read.return_value = b'{"response":"ollama result"}'
        context = MagicMock()
        context.__enter__.return_value = response

        with patch("app.services.llm_service.urlopen", return_value=context) as mocked_urlopen:
            result = llm_service.generate("analyze")

        self.assertEqual(result.provider, "ollama")
        self.assertEqual(result.text, "ollama result")
        self.assertFalse(result.fallback)
        request = mocked_urlopen.call_args.args[0]
        self.assertTrue(request.full_url.endswith("/api/generate"))
        self.assertEqual(json.loads(request.data)["model"], llm_service.OLLAMA_MODEL)
        self.assertEqual(mocked_urlopen.call_args.kwargs["timeout"], llm_service.LLM_REQUEST_TIMEOUT)

    def test_ollama_chat_response_format_is_supported(self):
        self.assertEqual(llm_service._parse_response('{"message":{"content":"chat result"}}'), "chat result")

    @patch("app.services.llm_service.USE_REAL_LLM", True)
    def test_invalid_ollama_response_logs_reason_and_falls_back(self):
        response = MagicMock()
        response.status = 200
        response.read.return_value = b'{"done":true}'
        context = MagicMock()
        context.__enter__.return_value = response

        with self.assertLogs("uvicorn.error", level="ERROR") as logs, patch("app.services.llm_service.urlopen", return_value=context):
            result = llm_service.generate("analyze")

        self.assertTrue(result.fallback)
        self.assertIn("invalid response format", " ".join(logs.output))

    @patch("app.services.llm_service.USE_REAL_LLM", False)
    def test_project_control_builds_context_and_saves_run(self):
        with closing(database.connect()) as db:
            user_id = db.execute("SELECT id FROM users WHERE email = 'demo@example.com'").fetchone()["id"]
            project_id = db.execute("SELECT id FROM projects ORDER BY id LIMIT 1").fetchone()["id"]

        result = chat(AgentChatRequest(agent="project_control", project_id=project_id, message="프로젝트 현황 분석"), user_id)

        self.assertEqual(result.agent, "Project Control Agent")
        self.assertIsNotNone(result.run_id)
        dashboard = result.context["dashboard_context"]
        self.assertEqual(dashboard["project_id"], project_id)
        self.assertGreaterEqual(dashboard["requirement_count"], 2)
        self.assertGreaterEqual(dashboard["development_task_count"], 2)
        self.assertGreaterEqual(dashboard["quality_result_count"], 1)
        self.assertTrue(dashboard["risk_candidates"])
        self.assertTrue(dashboard["next_action_candidates"])
        self.assertTrue(result.analysis["used_db_context"])
        self.assertTrue(result.analysis["saved_agent_run"])
        with closing(database.connect()) as db:
            run = db.execute("SELECT * FROM agent_runs WHERE id = ?", (result.run_id,)).fetchone()
            self.assertEqual(run["agent_name"], "project_control")
            self.assertEqual(run["status"], "success")
            self.assertIn("현재 프로젝트 상태 데이터", run["input_prompt"])
            self.assertEqual(run["output_result"], result.result)

    @patch("app.services.llm_service.OLLAMA_BASE_URL", "http://127.0.0.1:1")
    @patch("app.services.llm_service.USE_REAL_LLM", True)
    def test_project_control_ollama_failure_uses_db_fallback(self):
        with closing(database.connect()) as db:
            user_id = db.execute("SELECT id FROM users WHERE email = 'demo@example.com'").fetchone()["id"]

        result = chat(AgentChatRequest(agent="project_control", project_id=1, message="위험과 다음 액션"), user_id)

        self.assertTrue(result.mock)
        self.assertTrue(result.fallback)
        self.assertIn("다음 액션", result.result)
        with closing(database.connect()) as db:
            self.assertEqual(db.execute("SELECT status FROM agent_runs WHERE id = ?", (result.run_id,)).fetchone()["status"], "fallback")

    @patch("app.services.llm_service.USE_REAL_LLM", False)
    def test_swagger_password_flow_authorizes_agent_chat(self):
        with TestClient(app) as client:
            json_login = client.post("/api/auth/login", json={"email": "demo@example.com", "password": "1234"})
            self.assertEqual(json_login.status_code, 200, json_login.text)
            login = client.post("/api/auth/login", data={"username": "demo@example.com", "password": "1234"})
            self.assertEqual(login.status_code, 200, login.text)
            self.assertEqual(login.json()["token_type"], "bearer")
            headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
            projects = client.get("/api/projects", headers=headers).json()["projects"]
            response = client.post(
                "/api/agent/chat",
                headers=headers,
                json={"agent": "project_control", "project_id": projects[0]["id"], "message": "프로젝트 상태 요약"},
            )
            self.assertEqual(response.status_code, 200, response.text)

    def test_agent_catalog_and_sdlc_seed_are_stable(self):
        with closing(database.connect()) as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM agent_definitions").fetchone()[0], 25)
            self.assertEqual(db.execute("SELECT COUNT(*) FROM agent_definitions WHERE status = 'active'").fetchone()[0], 1)
            self.assertGreater(db.execute("SELECT COUNT(*) FROM requirements WHERE project_id = 1").fetchone()[0], 0)
            self.assertGreater(db.execute("SELECT COUNT(*) FROM development_tasks WHERE project_id = 1").fetchone()[0], 0)
            self.assertGreater(db.execute("SELECT COUNT(*) FROM quality_results WHERE project_id = 1").fetchone()[0], 0)

        with TestClient(app) as client:
            catalog = client.get("/api/agents")
            self.assertEqual(catalog.status_code, 200, catalog.text)
            self.assertEqual(len(catalog.json()["agents"]), 25)
            detail = client.get("/api/agents/requirement")
            self.assertEqual(detail.status_code, 200, detail.text)
            skeleton = client.post("/api/agent/chat", json={"agent": "requirement", "message": "상태 확인"})
            self.assertEqual(skeleton.status_code, 200, skeleton.text)
            self.assertEqual(skeleton.json()["analysis"]["status"], "skeleton")


if __name__ == "__main__":
    unittest.main()
