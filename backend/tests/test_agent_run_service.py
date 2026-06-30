import unittest
from app.schemas.agent import AgentChatRequest
from app.services.agent_run_service import chat


class AgentRunServiceTest(unittest.TestCase):
    def test_development_agent_returns_mock_response(self):
        result = chat(AgentChatRequest(message="Review auth.py", context={"file": "auth.py"}))

        self.assertEqual(result.agent, "Development Agent")
        self.assertTrue(result.mock)


if __name__ == "__main__":
    unittest.main()
