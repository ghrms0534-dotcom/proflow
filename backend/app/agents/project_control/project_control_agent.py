import json
import sqlite3
from contextlib import closing
from typing import Any

from app.agents.core.base_agent import MockAgent
from app.common import database
from app.common.exceptions import ProjectAccessError


class ProjectControlAgent(MockAgent):
    name = "Project Control Agent"
    description = "Summarizes project health, Section Agents, risks, and next actions."

    def build_dashboard_context(self, project_id: int, user_id: int) -> dict[str, Any]:
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
                "SELECT agent_name, status, provider, fallback, created_at FROM agent_runs WHERE project_id = ? ORDER BY id DESC LIMIT 10",
                (project_id,),
            ).fetchall()
            requirement_summary = self._status_summary(db, "requirements", project_id)
            development_summary = self._status_summary(db, "development_tasks", project_id)
            quality_summary = self._status_summary(db, "quality_results", project_id)
            quality_risk_count = db.execute(
                "SELECT COUNT(*) FROM quality_results WHERE project_id = ? AND (LOWER(status) IN ('failed', 'warning', 'blocked', 'critical') OR UPPER(risk_level) IN ('WARN', 'CRITICAL'))",
                (project_id,),
            ).fetchone()[0]
            definition_counts = db.execute(
                "SELECT status, COUNT(*) AS count FROM agent_definitions WHERE enabled = 1 GROUP BY status"
            ).fetchall()

        requirements_incomplete = self._count_not_done(requirement_summary, {"approved", "done", "completed", "closed"})
        development_pending = self._count_not_done(development_summary, {"done", "completed", "closed"})
        recent_runs = [dict(row) for row in runs]
        risks = []
        if requirements_incomplete:
            risks.append(f"미완료 요구사항이 {requirements_incomplete}건 있습니다.")
        if development_pending:
            risks.append(f"진행 중 또는 대기 개발 태스크가 {development_pending}건 있습니다.")
        if quality_risk_count:
            risks.append(f"실패 또는 주의 품질 결과가 {quality_risk_count}건 있습니다.")
        if len(activities) < 3:
            risks.append("최근 활동 로그가 부족합니다.")
        if any(run["status"] in {"failed", "fallback"} or run["fallback"] for run in recent_runs):
            risks.append("최근 Agent 실행에 실패 또는 fallback 이력이 있습니다.")

        actions = []
        if requirements_incomplete:
            actions.append("요구사항 우선순위와 승인 대상을 정리하세요.")
        if development_pending:
            actions.append("미완료 개발 태스크의 담당자와 완료 일정을 점검하세요.")
        if quality_risk_count:
            actions.append("실패 또는 주의 품질 결과를 재검증하세요.")
        if recent_runs:
            actions.append("최근 Agent 실행 결과와 fallback 원인을 확인하세요.")
        if not quality_risk_count:
            actions.append("Delivery 단계 준비 상태를 확인하세요.")

        counts = {row["status"]: row["count"] for row in definition_counts}
        return {
            "project_id": project["id"],
            "project_name": project["name"],
            "project_status": project["status"],
            "requirement_count": sum(requirement_summary.values()),
            "requirement_status_summary": requirement_summary,
            "development_task_count": sum(development_summary.values()),
            "development_task_status_summary": development_summary,
            "quality_result_count": sum(quality_summary.values()),
            "quality_status_summary": quality_summary,
            "recent_activity_count": len(activities),
            "recent_activities": [dict(row) for row in activities],
            "recent_agent_run_count": len(recent_runs),
            "recent_agent_runs": recent_runs,
            "active_agent_count": counts.get("active", 0),
            "skeleton_agent_count": counts.get("skeleton", 0) + counts.get("planned", 0),
            "risk_candidates": risks,
            "next_action_candidates": actions or ["현재 상태를 유지하며 다음 정기 점검을 준비하세요."],
        }

    def run(self, message: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
        dashboard_context = context or {}
        return {
            "summary": f"{dashboard_context['project_name']} 프로젝트는 {dashboard_context['project_status']} 상태입니다.",
            "risk_count": len(dashboard_context["risk_candidates"]),
            "next_action_count": len(dashboard_context["next_action_candidates"]),
            "used_db_context": True,
            "saved_agent_run": True,
            "risks": dashboard_context["risk_candidates"],
            "next_actions": dashboard_context["next_action_candidates"],
        }

    @staticmethod
    def build_prompt(message: str, dashboard_context: dict[str, Any]) -> str:
        return f"""현재 프로젝트 상태 데이터:
{json.dumps(dashboard_context, ensure_ascii=False, indent=2)}

사용자 질문:
{message}

응답 지침:
- 한국어로 답변
- 프로젝트 현황 요약
- 주요 위험 요소
- 원인 추정
- 다음 액션
- 운영자 관점의 판단
- 불필요한 JSON 나열 금지"""

    @staticmethod
    def render_mock(analysis: dict[str, Any]) -> str:
        risks = " ".join(analysis["risks"]) or "현재 확인된 주요 위험은 없습니다."
        return f"{analysis['summary']} 주요 위험: {risks} 다음 액션: {analysis['next_actions'][0]} 운영자 관점에서 위험 항목을 우선 점검해야 합니다."

    @staticmethod
    def _status_summary(db: sqlite3.Connection, table: str, project_id: int) -> dict[str, int]:
        return {row["status"]: row["count"] for row in db.execute(f"SELECT status, COUNT(*) AS count FROM {table} WHERE project_id = ? GROUP BY status", (project_id,)).fetchall()}

    @staticmethod
    def _count_not_done(summary: dict[str, int], done_statuses: set[str]) -> int:
        return sum(count for status, count in summary.items() if status.lower() not in done_statuses)
