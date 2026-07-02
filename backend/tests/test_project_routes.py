import unittest
from contextlib import closing
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.common import database
from app.db.seed import seed
from app.services import llm_service
from main import app


class ProjectRoutesTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.original_db_path = database.DB_PATH
        database.DB_PATH = Path(__file__).with_name("test_project_routes.db")
        database.init_db()
        with closing(database.connect()) as db:
            seed(db)
        cls.client = TestClient(app)
        login = cls.client.post("/api/auth/login", json={"email": "demo@example.com", "password": "1234"})
        cls.headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    @classmethod
    def tearDownClass(cls):
        cls.client.close()
        database.DB_PATH = cls.original_db_path

    def test_crud_activity_and_dashboard_use_database(self):
        created = self.client.post(
            "/api/projects/1/requirements", headers=self.headers,
            json={"requirement_key": "REQ-CRUD-CHECK", "title": "CRUD check", "status": "planned"},
        )
        if created.status_code == 409:
            existing = self.client.get("/api/projects/1/requirements", headers=self.headers).json()["requirements"]
            requirement_id = next(item["id"] for item in existing if item["requirement_key"] == "REQ-CRUD-CHECK")
        else:
            self.assertEqual(created.status_code, 201, created.text)
            requirement_id = created.json()["id"]

        updated = self.client.put(
            f"/api/projects/1/requirements/{requirement_id}", headers=self.headers, json={"status": "approved"}
        )
        self.assertEqual(updated.status_code, 200, updated.text)
        dashboard = self.client.get("/api/projects/1/dashboard", headers=self.headers)
        self.assertEqual(dashboard.status_code, 200, dashboard.text)
        body = dashboard.json()
        self.assertEqual(body["summary"]["total_tasks"], len(body["major_tasks"]))
        self.assertEqual(body["ai_recommendations"], [])
        self.assertTrue(any("요구사항" in item["message"] for item in body["recent_activities"]))
        self.assertEqual(self.client.delete(f"/api/projects/1/requirements/{requirement_id}", headers=self.headers).status_code, 204)

        quality = self.client.post(
            "/api/projects/1/quality-results", headers=self.headers,
            json={"result_key": "QA-CRUD-CHECK", "title": "Quality CRUD", "score": 80, "risk_level": "SAFE"},
        )
        if quality.status_code == 409:
            items = self.client.get("/api/projects/1/quality-results", headers=self.headers).json()["quality_results"]
            stale = next(item["id"] for item in items if item["result_key"] == "QA-CRUD-CHECK")
            self.client.delete(f"/api/projects/1/quality-results/{stale}", headers=self.headers)
            quality = self.client.post("/api/projects/1/quality-results", headers=self.headers, json={"result_key": "QA-CRUD-CHECK", "title": "Quality CRUD"})
        self.assertEqual(quality.status_code, 201, quality.text)
        self.assertEqual(self.client.delete(f"/api/projects/1/quality-results/{quality.json()['id']}", headers=self.headers).status_code, 204)

    def test_planning_crud_updates_activity_and_dashboard(self):
        cases = [
            ("schedules", "schedules", {"schedule_key": "SCH-CRUD", "title": "Schedule check"}),
            ("wbs", "wbs_items", {"wbs_key": "WBS-CRUD", "title": "WBS check"}),
            ("ui-designs", "ui_designs", {"design_key": "UI-CRUD", "title": "UI check"}),
            ("database-designs", "database_designs", {"design_key": "DB-CRUD", "title": "DB check"}),
            ("api-designs", "api_designs", {"design_key": "API-CRUD", "title": "API check"}),
        ]
        before = self.client.get("/api/projects/1/dashboard", headers=self.headers).json()["summary"]["total_tasks"]
        created = []
        added = 0
        for path, response_key, payload in cases:
            response = self.client.post(f"/api/projects/1/{path}", headers=self.headers, json=payload)
            if response.status_code == 409:
                key = next(name for name in payload if name.endswith("_key"))
                existing = self.client.get(f"/api/projects/1/{path}", headers=self.headers).json()[response_key]
                stale_id = next(item["id"] for item in existing if item[key] == payload[key])
                self.client.delete(f"/api/projects/1/{path}/{stale_id}", headers=self.headers)
                response = self.client.post(f"/api/projects/1/{path}", headers=self.headers, json=payload)
            else:
                added += 1
            self.assertEqual(response.status_code, 201, response.text)
            item_id = response.json()["id"]
            created.append((path, item_id))
            self.assertEqual(
                self.client.put(f"/api/projects/1/{path}/{item_id}", headers=self.headers, json={"status": "completed"}).status_code,
                200,
            )
            listed = self.client.get(f"/api/projects/1/{path}", headers=self.headers).json()[response_key]
            self.assertTrue(any(item["id"] == item_id for item in listed))

        dashboard = self.client.get("/api/projects/1/dashboard", headers=self.headers).json()
        self.assertEqual(dashboard["summary"]["total_tasks"], before + added)
        self.assertTrue(any(item["type"] == "API Design" for item in dashboard["recent_activities"]))
        for path, item_id in created:
            self.assertEqual(self.client.delete(f"/api/projects/1/{path}/{item_id}", headers=self.headers).status_code, 204)

    def test_document_upload_rag_context_and_delete(self):
        summary = llm_service.LlmResult("요구사항 문서 요약", "mock", "qwen2.5:3b", False)
        with patch("app.api.project_routes.generate", return_value=summary):
            uploaded = self.client.post("/api/projects/1/documents/upload", headers=self.headers,
                                        files={"file": ("requirements.md", b"# Requirements\nLogin and audit logging", "text/markdown")})
        self.assertEqual(uploaded.status_code, 201, uploaded.text)
        document = uploaded.json()
        self.assertEqual(document["filename"], "requirements.md")
        self.assertEqual(document["summary"], "요구사항 문서 요약")

        listed = self.client.get("/api/projects/1/documents", headers=self.headers).json()
        self.assertTrue(any(item["id"] == document["id"] for item in listed["project_documents"]))
        detail = self.client.get(f"/api/projects/1/documents/{document['id']}", headers=self.headers)
        self.assertIn("Login and audit logging", detail.json()["project_document"]["extracted_text"])
        context = self.client.get("/api/projects/1/agent-context", headers=self.headers).json()
        self.assertEqual(context["document_context"][0]["filename"], "requirements.md")

        with patch("app.services.agent_run_service.generate", return_value=summary) as generate:
            run = self.client.post("/api/agents/run", headers=self.headers,
                                   json={"project_id": 1, "agent_type": "requirement", "user_input": "문서 분석"})
        self.assertEqual(run.status_code, 200, run.text)
        self.assertIn("project_documents", generate.call_args.args[0])
        with patch("app.services.agent_run_service.generate", return_value=summary) as generate:
            orchestration = self.client.post("/api/project-control/orchestrate", headers=self.headers,
                                             json={"project_id": 1, "user_input": "문서 기반 실행", "plan": ["requirement"]})
        self.assertEqual(orchestration.status_code, 200, orchestration.text)
        self.assertIn("project_documents", generate.call_args.args[0])
        dashboard = self.client.get("/api/projects/1/dashboard", headers=self.headers).json()
        self.assertGreaterEqual(dashboard["project_documents"]["count"], 1)
        self.assertTrue(dashboard["project_documents"]["context_used"])

        empty = self.client.post("/api/projects/1/documents/upload", headers=self.headers,
                                 files={"file": ("empty.txt", b"", "text/plain")})
        unsupported = self.client.post("/api/projects/1/documents/upload", headers=self.headers,
                                       files={"file": ("image.png", b"png", "image/png")})
        self.assertEqual(empty.status_code, 400)
        self.assertEqual(unsupported.status_code, 415)
        self.assertEqual(self.client.delete(f"/api/projects/1/documents/{document['id']}?uploaded=true", headers=self.headers).status_code, 204)
        remaining = self.client.get("/api/projects/1/documents", headers=self.headers).json()["project_documents"]
        self.assertFalse(any(item["id"] == document["id"] for item in remaining))

    def test_development_area_crud_updates_activity_and_dashboard(self):
        cases = [
            ("unit-tests", "unit_tests", {"title": "Unit CRUD", "target_module": "auth", "coverage": 70}),
            ("integration-tests", "integration_tests", {"title": "Integration CRUD", "target_scope": "login", "scenario_count": 3}),
            ("code-reviews", "code_reviews", {"title": "Review CRUD", "repository": "proflow", "branch": "main"}),
            ("deployments", "deployments", {"title": "Deploy CRUD", "environment": "dev", "version": "test"}),
        ]
        before = self.client.get("/api/projects/1/dashboard", headers=self.headers).json()["summary"]["total_tasks"]
        created = []
        for path, response_key, payload in cases:
            response = self.client.post(f"/api/projects/1/{path}", headers=self.headers, json=payload)
            self.assertEqual(response.status_code, 201, response.text)
            item_id = response.json()["id"]
            created.append((path, item_id))
            self.assertEqual(self.client.put(f"/api/projects/1/{path}/{item_id}", headers=self.headers, json={"status": "completed"}).status_code, 200)
            listed = self.client.get(f"/api/projects/1/{path}", headers=self.headers).json()[response_key]
            self.assertTrue(any(item["id"] == item_id for item in listed))

        dashboard = self.client.get("/api/projects/1/dashboard", headers=self.headers).json()
        self.assertEqual(dashboard["summary"]["total_tasks"], before + len(cases))
        development = next(stage for stage in dashboard["stages"] if stage["name"] == "Development and Test")
        self.assertGreaterEqual(development["completed"], len(cases))
        self.assertTrue(any(item["type"] == "Deployment" for item in dashboard["recent_activities"]))
        for path, item_id in created:
            self.assertEqual(self.client.delete(f"/api/projects/1/{path}/{item_id}", headers=self.headers).status_code, 204)

    def test_delivery_area_crud_updates_activity_risk_and_dashboard(self):
        cases = [
            ("defects", "defects", {"title": "Defect CRUD", "severity": "CRITICAL", "source": "test"}),
            ("documents", "documents", {"title": "Document CRUD", "document_type": "API", "version": "1.0"}),
            ("outputs", "outputs", {"title": "Output CRUD", "output_type": "Report", "version": "1.0"}),
        ]
        before = self.client.get("/api/projects/1/dashboard", headers=self.headers).json()["summary"]["total_tasks"]
        created = []
        for path, response_key, payload in cases:
            response = self.client.post(f"/api/projects/1/{path}", headers=self.headers, json=payload)
            self.assertEqual(response.status_code, 201, response.text)
            item_id = response.json()["id"]
            created.append((path, item_id))
            self.assertEqual(self.client.put(f"/api/projects/1/{path}/{item_id}", headers=self.headers, json={"status": "completed"}).status_code, 200)
            listed = self.client.get(f"/api/projects/1/{path}", headers=self.headers).json()[response_key]
            self.assertTrue(any(item["id"] == item_id for item in listed))

        dashboard = self.client.get("/api/projects/1/dashboard", headers=self.headers).json()
        self.assertEqual(dashboard["summary"]["total_tasks"], before + len(cases))
        self.assertEqual(dashboard["summary"]["risk_level"], "CRITICAL")
        verification = next(stage for stage in dashboard["stages"] if stage["name"] == "Validation and Delivery")
        self.assertGreaterEqual(verification["completed"], len(cases))
        self.assertTrue(any(item["type"] == "Output" for item in dashboard["recent_activities"]))
        for path, item_id in created:
            self.assertEqual(self.client.delete(f"/api/projects/1/{path}/{item_id}", headers=self.headers).status_code, 204)


if __name__ == "__main__":
    unittest.main()
