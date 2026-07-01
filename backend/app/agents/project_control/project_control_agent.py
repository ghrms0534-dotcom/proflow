import sqlite3
from contextlib import closing
from typing import Any

from app.agents.core.base_agent import MockAgent
from app.common import database
from app.common.exceptions import ProjectAccessError


class ProjectControlAgent(MockAgent):
    name = "Project Control Agent"
    description = "Summarizes project health, Section Agents, risks, and next actions."

    def build_context(self, project_id: int, user_id: int) -> dict[str, Any]:
        with closing(database.connect()) as db:
            project = db.execute(
                """
                SELECT p.*, pm.role AS member_role
                FROM projects p
                JOIN project_members pm ON pm.project_id = p.id
                WHERE p.id = ? AND pm.user_id = ?
                """,
                (project_id, user_id),
            ).fetchone()
            if not project:
                raise ProjectAccessError(f"Project access denied: {project_id}")

            activities = db.execute(
                "SELECT message, type, created_at FROM activity_logs WHERE project_id = ? ORDER BY created_at DESC LIMIT 10",
                (project_id,),
            ).fetchall()
            runs = db.execute(
                "SELECT agent_name, provider, mock, fallback, created_at FROM agent_runs WHERE project_id = ? ORDER BY id DESC LIMIT 10",
                (project_id,),
            ).fetchall()
            definitions = db.execute(
                "SELECT agent_key, agent_name, section_key, section_name, description, status, sort_order FROM agent_definitions WHERE enabled = 1 ORDER BY sort_order, id"
            ).fetchall()
            requirements = self._table_summary(db, "requirements", project_id)
            development = self._table_summary(db, "development_tasks", project_id)
            quality = self._table_summary(db, "quality_results", project_id)

        return {
            "project": dict(project),
            "requirements": requirements,
            "development_tasks": development,
            "quality_results": quality,
            "activity_logs": [dict(row) for row in activities],
            "recent_activities": [dict(row) for row in activities],
            "agent_runs": [dict(row) for row in runs],
            "agent_definitions": [dict(row) for row in definitions],
        }

    def run(self, message: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
        context = context or {}
        project = context["project"]
        requirements = context["requirements"]
        development = context["development_tasks"]
        quality = context["quality_results"]
        runs = context["agent_runs"]
        missing = [label for label, data in (("요구사항", requirements), ("개발 태스크", development), ("품질 결과", quality)) if not data["available"]]
        risks = ([f"{', '.join(missing)} 데이터가 아직 저장되지 않았습니다."] if missing else [])
        risks += (["최근 Agent 실행에서 fallback이 발생했습니다."] if any(run["fallback"] for run in runs) else [])
        if not risks:
            risks.append("현재 저장 데이터 기준 Critical 위험은 없습니다.")
        priorities = ["누락된 SDLC 데이터를 backend에 연결하세요."] if missing else ["미완료 업무를 우선 처리하세요."]
        priorities.append("Project Control 분석을 실행 이력과 함께 주기적으로 갱신하세요.")
        sections = {
            "Planning Analysis Agent": self._section_status(requirements),
            "Development Execution Agent": self._section_status(development),
            "Delivery Agent": self._section_status(quality),
            "System Control Agent": {"status": "운영중", "total": len(context["recent_activities"])},
        }
        return {
            "summary": f"{project['name']} 프로젝트는 {project['status']} 상태이며 최근 활동 {len(context['recent_activities'])}건, Agent 실행 {len(runs)}건이 확인됩니다.",
            "risks": risks,
            "recommended_actions": priorities,
            "section_agents": sections,
            "context": context,
        }

    @staticmethod
    def render_mock(analysis: dict[str, Any]) -> str:
        return f"{analysis['summary']} 위험: {' '.join(analysis['risks'])} 다음 액션: {analysis['recommended_actions'][0]}"

    @staticmethod
    def _section_status(summary: dict[str, Any]) -> dict[str, Any]:
        return {"status": "진행중" if summary["total"] else "데이터 대기", "total": summary["total"], "by_status": summary["by_status"]}

    @staticmethod
    def _table_summary(db: sqlite3.Connection, table: str, project_id: int) -> dict[str, Any]:
        if not db.execute("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?", (table,)).fetchone():
            return {"available": False, "total": 0, "by_status": {}}
        columns = {row["name"] for row in db.execute(f"PRAGMA table_info({table})").fetchall()}
        if "project_id" not in columns:
            return {"available": True, "total": 0, "by_status": {}}
        total = db.execute(f"SELECT COUNT(*) FROM {table} WHERE project_id = ?", (project_id,)).fetchone()[0]
        by_status = {}
        if "status" in columns:
            by_status = {row["status"]: row["count"] for row in db.execute(f"SELECT status, COUNT(*) AS count FROM {table} WHERE project_id = ? GROUP BY status", (project_id,)).fetchall()}
        return {"available": True, "total": total, "by_status": by_status}
