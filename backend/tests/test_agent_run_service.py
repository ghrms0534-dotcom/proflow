import unittest
from contextlib import closing
from pathlib import Path
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.common import database
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
        response.read.return_value = b'{"response":"ollama result"}'
        context = MagicMock()
        context.__enter__.return_value = response

        with patch("app.services.llm_service.urlopen", return_value=context):
            result = llm_service.generate("analyze")

        self.assertEqual(result.provider, "ollama")
        self.assertEqual(result.text, "ollama result")
        self.assertFalse(result.fallback)

    @patch("app.services.llm_service.USE_REAL_LLM", False)
    def test_project_control_builds_context_and_saves_run(self):
        with closing(database.connect()) as db:
            user_id = db.execute("SELECT id FROM users WHERE email = 'demo@example.com'").fetchone()["id"]
            project_id = db.execute("SELECT id FROM projects ORDER BY id LIMIT 1").fetchone()["id"]

        result = chat(AgentChatRequest(agent="project_control", project_id=project_id, message="프로젝트 현황 분석"), user_id)

        self.assertEqual(result.agent, "Project Control Agent")
        self.assertIsNotNone(result.run_id)
        self.assertIn("section_agents", result.analysis)
        with closing(database.connect()) as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM agent_runs WHERE id = ?", (result.run_id,)).fetchone()[0], 1)

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


if __name__ == "__main__":
    unittest.main()
