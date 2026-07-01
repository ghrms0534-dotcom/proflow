import sqlite3
from contextlib import closing
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status

from app import schemas
from app.api.auth_routes import get_current_user
from app.common import database

router = APIRouter(prefix="/projects", tags=["Projects"])
DONE = {"approved", "completed", "done", "closed", "passed"}
WAITING = {"planned", "pending", "waiting", "todo"}


@router.get("")
def list_projects(current_user=Depends(get_current_user)):
    with closing(database.connect()) as db:
        rows = db.execute(
            "SELECT p.*, pm.role AS member_role FROM projects p JOIN project_members pm ON pm.project_id = p.id WHERE pm.user_id = ? ORDER BY p.id",
            (current_user["id"],),
        ).fetchall()
        return {"projects": [dict(row) for row in rows]}


@router.get("/{project_id}/dashboard", response_model=schemas.DashboardResponse)
def dashboard(project_id: int, current_user=Depends(get_current_user)):
    require_member(project_id, current_user["id"])
    with closing(database.connect()) as db:
        project = db.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        requirements = _rows(db, "requirements", project_id)
        planning_items = requirements + [
            row for table in ("schedules", "wbs_items", "ui_designs", "database_designs", "api_designs")
            for row in _rows(db, table, project_id)
        ]
        tasks = _rows(db, "development_tasks", project_id) + [
            row for table in ("unit_tests", "integration_tests", "code_reviews", "deployments")
            for row in _rows(db, table, project_id)
        ]
        quality = _rows(db, "quality_results", project_id) + [
            row for table in ("defects", "documents", "outputs") for row in _rows(db, table, project_id)
        ]
        activities = db.execute("SELECT * FROM activity_logs WHERE project_id = ? ORDER BY created_at DESC, id DESC LIMIT 20", (project_id,)).fetchall()
        groups = [("Analysis and Design", planning_items), ("Development and Test", tasks), ("Validation and Delivery", quality)]
        stages = [_stage(name, rows) for name, rows in groups]
        total = sum(len(rows) for _, rows in groups)
        completed = sum(item["completed"] for item in stages)
        waiting = sum(item["waiting"] for item in stages)
        major_tasks = [
            {"no": row["id"], "name": row["title"], "owner": row["owner"] if "owner" in row.keys() else row["reviewer"] if "reviewer" in row.keys() else "QA",
             "status": row["status"], "due_date": project["end_date"], "stage": stage_name,
             "priority": row["priority"] if "priority" in row.keys() else row["risk_level"] if "risk_level" in row.keys() else "MEDIUM"}
            for stage_name, rows in groups for row in rows
        ]
        return {
            "summary": {"progress": round(completed / total * 100) if total else 0, "total_tasks": total,
                        "completed_tasks": completed, "in_progress_tasks": total - completed - waiting,
                        "waiting_tasks": waiting, "days_left": _days_left(project["end_date"]),
                        "risk_level": _risk_level(planning_items, tasks, quality), "client": project["description"] or "Internal"},
            "stages": stages, "major_tasks": major_tasks, "ai_recommendations": [],
            "recent_activities": [dict(row) for row in activities],
            "project_info": {"name": project["name"], "customer": project["description"] or "Internal",
                             "pm": current_user["name"], "period": f"{project['start_date']} ~ {project['end_date']}",
                             "base_date": date.today().isoformat()},
        }


@router.get("/{project_id}/activities")
def activities(project_id: int, current_user=Depends(get_current_user)):
    require_member(project_id, current_user["id"])
    with closing(database.connect()) as db:
        rows = db.execute("SELECT * FROM activity_logs WHERE project_id = ? ORDER BY created_at DESC, id DESC LIMIT 20", (project_id,)).fetchall()
        return {"activities": [dict(row) for row in rows]}


def require_member(project_id: int, user_id: int) -> None:
    with closing(database.connect()) as db:
        if not db.execute("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?", (project_id, user_id)).fetchone():
            raise HTTPException(status_code=403, detail="Project access denied")


@router.get("/{project_id}/requirements")
def list_requirements(project_id: int, current_user=Depends(get_current_user)):
    return _list(project_id, current_user["id"], "requirements")


@router.post("/{project_id}/requirements", status_code=status.HTTP_201_CREATED)
def create_requirement(project_id: int, payload: schemas.RequirementCreate, current_user=Depends(get_current_user)):
    return _create(project_id, current_user["id"], "requirements", "requirement_key", payload, "요구사항 생성", "Requirement")


@router.put("/{project_id}/requirements/{requirement_id}")
def update_requirement(project_id: int, requirement_id: int, payload: schemas.RequirementUpdate, current_user=Depends(get_current_user)):
    return _update(project_id, current_user["id"], "requirements", requirement_id, payload, "요구사항 수정", "Requirement")


@router.delete("/{project_id}/requirements/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_requirement(project_id: int, requirement_id: int, current_user=Depends(get_current_user)):
    _delete(project_id, current_user["id"], "requirements", requirement_id, "요구사항 삭제", "Requirement")


@router.get("/{project_id}/development-tasks")
def list_development_tasks(project_id: int, current_user=Depends(get_current_user)):
    return _list(project_id, current_user["id"], "development_tasks")


@router.post("/{project_id}/development-tasks", status_code=status.HTTP_201_CREATED)
def create_development_task(project_id: int, payload: schemas.DevelopmentTaskCreate, current_user=Depends(get_current_user)):
    return _create(project_id, current_user["id"], "development_tasks", "task_key", payload, "개발 태스크 생성", "Development")


@router.put("/{project_id}/development-tasks/{task_id}")
def update_development_task(project_id: int, task_id: int, payload: schemas.DevelopmentTaskUpdate, current_user=Depends(get_current_user)):
    return _update(project_id, current_user["id"], "development_tasks", task_id, payload, "개발 태스크 수정", "Development")


@router.delete("/{project_id}/development-tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_development_task(project_id: int, task_id: int, current_user=Depends(get_current_user)):
    _delete(project_id, current_user["id"], "development_tasks", task_id, "개발 태스크 삭제", "Development")


@router.get("/{project_id}/quality-results")
def list_quality_results(project_id: int, current_user=Depends(get_current_user)):
    return _list(project_id, current_user["id"], "quality_results")


@router.post("/{project_id}/quality-results", status_code=status.HTTP_201_CREATED)
def create_quality_result(project_id: int, payload: schemas.QualityResultCreate, current_user=Depends(get_current_user)):
    return _create(project_id, current_user["id"], "quality_results", "result_key", payload, "품질 결과 생성", "Quality")


@router.put("/{project_id}/quality-results/{result_id}")
def update_quality_result(project_id: int, result_id: int, payload: schemas.QualityResultUpdate, current_user=Depends(get_current_user)):
    return _update(project_id, current_user["id"], "quality_results", result_id, payload, "품질 결과 수정", "Quality")


@router.delete("/{project_id}/quality-results/{result_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quality_result(project_id: int, result_id: int, current_user=Depends(get_current_user)):
    _delete(project_id, current_user["id"], "quality_results", result_id, "품질 결과 삭제", "Quality")


@router.get("/{project_id}/schedules")
def list_schedules(project_id: int, current_user=Depends(get_current_user)):
    return _list(project_id, current_user["id"], "schedules")


@router.post("/{project_id}/schedules", status_code=status.HTTP_201_CREATED)
def create_schedule(project_id: int, payload: schemas.ScheduleCreate, current_user=Depends(get_current_user)):
    return _create(project_id, current_user["id"], "schedules", "schedule_key", payload, "일정 생성", "Schedule")


@router.put("/{project_id}/schedules/{item_id}")
def update_schedule(project_id: int, item_id: int, payload: schemas.ScheduleUpdate, current_user=Depends(get_current_user)):
    return _update(project_id, current_user["id"], "schedules", item_id, payload, "일정 수정", "Schedule")


@router.delete("/{project_id}/schedules/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(project_id: int, item_id: int, current_user=Depends(get_current_user)):
    _delete(project_id, current_user["id"], "schedules", item_id, "일정 삭제", "Schedule")


@router.get("/{project_id}/wbs")
def list_wbs(project_id: int, current_user=Depends(get_current_user)):
    return _list(project_id, current_user["id"], "wbs_items")


@router.post("/{project_id}/wbs", status_code=status.HTTP_201_CREATED)
def create_wbs(project_id: int, payload: schemas.WbsCreate, current_user=Depends(get_current_user)):
    return _create(project_id, current_user["id"], "wbs_items", "wbs_key", payload, "WBS 생성", "WBS")


@router.put("/{project_id}/wbs/{item_id}")
def update_wbs(project_id: int, item_id: int, payload: schemas.WbsUpdate, current_user=Depends(get_current_user)):
    return _update(project_id, current_user["id"], "wbs_items", item_id, payload, "WBS 수정", "WBS")


@router.delete("/{project_id}/wbs/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wbs(project_id: int, item_id: int, current_user=Depends(get_current_user)):
    _delete(project_id, current_user["id"], "wbs_items", item_id, "WBS 삭제", "WBS")


@router.get("/{project_id}/ui-designs")
def list_ui_designs(project_id: int, current_user=Depends(get_current_user)):
    return _list(project_id, current_user["id"], "ui_designs")


@router.post("/{project_id}/ui-designs", status_code=status.HTTP_201_CREATED)
def create_ui_design(project_id: int, payload: schemas.DesignCreate, current_user=Depends(get_current_user)):
    return _create(project_id, current_user["id"], "ui_designs", "design_key", payload, "UI 설계 생성", "UI Design")


@router.put("/{project_id}/ui-designs/{item_id}")
def update_ui_design(project_id: int, item_id: int, payload: schemas.DesignUpdate, current_user=Depends(get_current_user)):
    return _update(project_id, current_user["id"], "ui_designs", item_id, payload, "UI 설계 수정", "UI Design")


@router.delete("/{project_id}/ui-designs/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ui_design(project_id: int, item_id: int, current_user=Depends(get_current_user)):
    _delete(project_id, current_user["id"], "ui_designs", item_id, "UI 설계 삭제", "UI Design")


@router.get("/{project_id}/database-designs")
def list_database_designs(project_id: int, current_user=Depends(get_current_user)):
    return _list(project_id, current_user["id"], "database_designs")


@router.post("/{project_id}/database-designs", status_code=status.HTTP_201_CREATED)
def create_database_design(project_id: int, payload: schemas.DesignCreate, current_user=Depends(get_current_user)):
    return _create(project_id, current_user["id"], "database_designs", "design_key", payload, "DB 설계 생성", "DB Design")


@router.put("/{project_id}/database-designs/{item_id}")
def update_database_design(project_id: int, item_id: int, payload: schemas.DesignUpdate, current_user=Depends(get_current_user)):
    return _update(project_id, current_user["id"], "database_designs", item_id, payload, "DB 설계 수정", "DB Design")


@router.delete("/{project_id}/database-designs/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_database_design(project_id: int, item_id: int, current_user=Depends(get_current_user)):
    _delete(project_id, current_user["id"], "database_designs", item_id, "DB 설계 삭제", "DB Design")


@router.get("/{project_id}/api-designs")
def list_api_designs(project_id: int, current_user=Depends(get_current_user)):
    return _list(project_id, current_user["id"], "api_designs")


@router.post("/{project_id}/api-designs", status_code=status.HTTP_201_CREATED)
def create_api_design(project_id: int, payload: schemas.DesignCreate, current_user=Depends(get_current_user)):
    return _create(project_id, current_user["id"], "api_designs", "design_key", payload, "API 설계 생성", "API Design")


@router.put("/{project_id}/api-designs/{item_id}")
def update_api_design(project_id: int, item_id: int, payload: schemas.DesignUpdate, current_user=Depends(get_current_user)):
    return _update(project_id, current_user["id"], "api_designs", item_id, payload, "API 설계 수정", "API Design")


@router.delete("/{project_id}/api-designs/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_api_design(project_id: int, item_id: int, current_user=Depends(get_current_user)):
    _delete(project_id, current_user["id"], "api_designs", item_id, "API 설계 삭제", "API Design")


@router.get("/{project_id}/unit-tests")
def list_unit_tests(project_id: int, current_user=Depends(get_current_user)):
    return _list(project_id, current_user["id"], "unit_tests")


@router.post("/{project_id}/unit-tests", status_code=status.HTTP_201_CREATED)
def create_unit_test(project_id: int, payload: schemas.UnitTestCreate, current_user=Depends(get_current_user)):
    return _create(project_id, current_user["id"], "unit_tests", None, payload, "단위 테스트 생성", "Unit Test")


@router.put("/{project_id}/unit-tests/{item_id}")
def update_unit_test(project_id: int, item_id: int, payload: schemas.UnitTestUpdate, current_user=Depends(get_current_user)):
    return _update(project_id, current_user["id"], "unit_tests", item_id, payload, "단위 테스트 수정", "Unit Test")


@router.delete("/{project_id}/unit-tests/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unit_test(project_id: int, item_id: int, current_user=Depends(get_current_user)):
    _delete(project_id, current_user["id"], "unit_tests", item_id, "단위 테스트 삭제", "Unit Test")


@router.get("/{project_id}/integration-tests")
def list_integration_tests(project_id: int, current_user=Depends(get_current_user)):
    return _list(project_id, current_user["id"], "integration_tests")


@router.post("/{project_id}/integration-tests", status_code=status.HTTP_201_CREATED)
def create_integration_test(project_id: int, payload: schemas.IntegrationTestCreate, current_user=Depends(get_current_user)):
    return _create(project_id, current_user["id"], "integration_tests", None, payload, "통합 테스트 생성", "Integration Test")


@router.put("/{project_id}/integration-tests/{item_id}")
def update_integration_test(project_id: int, item_id: int, payload: schemas.IntegrationTestUpdate, current_user=Depends(get_current_user)):
    return _update(project_id, current_user["id"], "integration_tests", item_id, payload, "통합 테스트 수정", "Integration Test")


@router.delete("/{project_id}/integration-tests/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_integration_test(project_id: int, item_id: int, current_user=Depends(get_current_user)):
    _delete(project_id, current_user["id"], "integration_tests", item_id, "통합 테스트 삭제", "Integration Test")


@router.get("/{project_id}/code-reviews")
def list_code_reviews(project_id: int, current_user=Depends(get_current_user)):
    return _list(project_id, current_user["id"], "code_reviews")


@router.post("/{project_id}/code-reviews", status_code=status.HTTP_201_CREATED)
def create_code_review(project_id: int, payload: schemas.CodeReviewCreate, current_user=Depends(get_current_user)):
    return _create(project_id, current_user["id"], "code_reviews", None, payload, "코드 리뷰 생성", "Code Review")


@router.put("/{project_id}/code-reviews/{item_id}")
def update_code_review(project_id: int, item_id: int, payload: schemas.CodeReviewUpdate, current_user=Depends(get_current_user)):
    return _update(project_id, current_user["id"], "code_reviews", item_id, payload, "코드 리뷰 수정", "Code Review")


@router.delete("/{project_id}/code-reviews/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_code_review(project_id: int, item_id: int, current_user=Depends(get_current_user)):
    _delete(project_id, current_user["id"], "code_reviews", item_id, "코드 리뷰 삭제", "Code Review")


@router.get("/{project_id}/deployments")
def list_deployments(project_id: int, current_user=Depends(get_current_user)):
    return _list(project_id, current_user["id"], "deployments")


@router.post("/{project_id}/deployments", status_code=status.HTTP_201_CREATED)
def create_deployment(project_id: int, payload: schemas.DeploymentCreate, current_user=Depends(get_current_user)):
    return _create(project_id, current_user["id"], "deployments", None, payload, "배포 생성", "Deployment")


@router.put("/{project_id}/deployments/{item_id}")
def update_deployment(project_id: int, item_id: int, payload: schemas.DeploymentUpdate, current_user=Depends(get_current_user)):
    return _update(project_id, current_user["id"], "deployments", item_id, payload, "배포 수정", "Deployment")


@router.delete("/{project_id}/deployments/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deployment(project_id: int, item_id: int, current_user=Depends(get_current_user)):
    _delete(project_id, current_user["id"], "deployments", item_id, "배포 삭제", "Deployment")


@router.get("/{project_id}/defects")
def list_defects(project_id: int, current_user=Depends(get_current_user)):
    return _list(project_id, current_user["id"], "defects")


@router.post("/{project_id}/defects", status_code=status.HTTP_201_CREATED)
def create_defect(project_id: int, payload: schemas.DefectCreate, current_user=Depends(get_current_user)):
    return _create(project_id, current_user["id"], "defects", None, payload, "결함 생성", "Defect")


@router.put("/{project_id}/defects/{item_id}")
def update_defect(project_id: int, item_id: int, payload: schemas.DefectUpdate, current_user=Depends(get_current_user)):
    return _update(project_id, current_user["id"], "defects", item_id, payload, "결함 수정", "Defect")


@router.delete("/{project_id}/defects/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_defect(project_id: int, item_id: int, current_user=Depends(get_current_user)):
    _delete(project_id, current_user["id"], "defects", item_id, "결함 삭제", "Defect")


@router.get("/{project_id}/documents")
def list_documents(project_id: int, current_user=Depends(get_current_user)):
    return _list(project_id, current_user["id"], "documents")


@router.post("/{project_id}/documents", status_code=status.HTTP_201_CREATED)
def create_document(project_id: int, payload: schemas.DocumentCreate, current_user=Depends(get_current_user)):
    return _create(project_id, current_user["id"], "documents", None, payload, "문서 생성", "Document")


@router.put("/{project_id}/documents/{item_id}")
def update_document(project_id: int, item_id: int, payload: schemas.DocumentUpdate, current_user=Depends(get_current_user)):
    return _update(project_id, current_user["id"], "documents", item_id, payload, "문서 수정", "Document")


@router.delete("/{project_id}/documents/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(project_id: int, item_id: int, current_user=Depends(get_current_user)):
    _delete(project_id, current_user["id"], "documents", item_id, "문서 삭제", "Document")


@router.get("/{project_id}/outputs")
def list_outputs(project_id: int, current_user=Depends(get_current_user)):
    return _list(project_id, current_user["id"], "outputs")


@router.post("/{project_id}/outputs", status_code=status.HTTP_201_CREATED)
def create_output(project_id: int, payload: schemas.OutputCreate, current_user=Depends(get_current_user)):
    return _create(project_id, current_user["id"], "outputs", None, payload, "산출물 생성", "Output")


@router.put("/{project_id}/outputs/{item_id}")
def update_output(project_id: int, item_id: int, payload: schemas.OutputUpdate, current_user=Depends(get_current_user)):
    return _update(project_id, current_user["id"], "outputs", item_id, payload, "산출물 수정", "Output")


@router.delete("/{project_id}/outputs/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_output(project_id: int, item_id: int, current_user=Depends(get_current_user)):
    _delete(project_id, current_user["id"], "outputs", item_id, "산출물 삭제", "Output")


def _list(project_id: int, user_id: int, table: str):
    require_member(project_id, user_id)
    with closing(database.connect()) as db:
        return {table: [dict(row) for row in _rows(db, table, project_id)]}


def _create(project_id: int, user_id: int, table: str, key_name: str | None, payload, message: str, log_type: str):
    require_member(project_id, user_id)
    values = payload.model_dump()
    columns = ["project_id", *values]
    try:
        with closing(database.connect()) as db:
            cursor = db.execute(
                f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({', '.join('?' for _ in columns)})",
                (project_id, *values.values()),
            )
            _log(db, project_id, f"{message}: {values[key_name] + ' ' if key_name else ''}{values['title']}", log_type)
            db.commit()
            return dict(db.execute(f"SELECT * FROM {table} WHERE id = ?", (cursor.lastrowid,)).fetchone())
    except sqlite3.IntegrityError as exc:
        raise HTTPException(status_code=409, detail=f"{key_name or 'item'} already exists") from exc


def _update(project_id: int, user_id: int, table: str, row_id: int, payload, message: str, log_type: str):
    require_member(project_id, user_id)
    values = payload.model_dump(exclude_none=True)
    if not values:
        raise HTTPException(status_code=400, detail="No fields to update")
    try:
        with closing(database.connect()) as db:
            cursor = db.execute(
                f"UPDATE {table} SET {', '.join(f'{key} = ?' for key in values)} WHERE id = ? AND project_id = ?",
                (*values.values(), row_id, project_id),
            )
            if not cursor.rowcount:
                raise HTTPException(status_code=404, detail="Item not found")
            _log(db, project_id, f"{message}: #{row_id}", log_type)
            db.commit()
            return dict(db.execute(f"SELECT * FROM {table} WHERE id = ?", (row_id,)).fetchone())
    except sqlite3.IntegrityError as exc:
        raise HTTPException(status_code=409, detail="Key already exists") from exc


def _delete(project_id: int, user_id: int, table: str, row_id: int, message: str, log_type: str) -> None:
    require_member(project_id, user_id)
    with closing(database.connect()) as db:
        cursor = db.execute(f"DELETE FROM {table} WHERE id = ? AND project_id = ?", (row_id, project_id))
        if not cursor.rowcount:
            raise HTTPException(status_code=404, detail="Item not found")
        _log(db, project_id, f"{message}: #{row_id}", log_type)
        db.commit()


def _rows(db, table: str, project_id: int):
    # ponytail: table names are internal constants; whitelist if exposed to request input later.
    return db.execute(f"SELECT * FROM {table} WHERE project_id = ? ORDER BY created_at DESC, id DESC", (project_id,)).fetchall()


def _stage(name: str, rows) -> dict:
    completed = sum(row["status"].lower() in DONE for row in rows)
    waiting = sum(row["status"].lower() in WAITING for row in rows)
    in_progress = len(rows) - completed - waiting
    state = "Completed" if rows and completed == len(rows) else "Pending" if not rows or waiting == len(rows) else "In Progress"
    return {"name": name, "progress": round(completed / len(rows) * 100) if rows else 0, "status": state,
            "completed": completed, "in_progress": in_progress, "waiting": waiting}


def _risk_level(requirements, tasks, quality) -> str:
    risks = {
        (row["risk_level"] if "risk_level" in row.keys() else row["severity"] if "severity" in row.keys() else "").upper()
        for row in quality
    }
    quality_statuses = {row["status"].lower() for row in quality}
    if "CRITICAL" in risks or quality_statuses & {"failed", "blocked", "critical"}:
        return "CRITICAL"
    incomplete = any(row["status"].lower() not in DONE for row in [*requirements, *tasks])
    return "WARN" if risks & {"WARN", "WARNING", "HIGH"} or incomplete else "SAFE"


def _days_left(end_date: str) -> int:
    try:
        return max((date.fromisoformat(end_date) - date.today()).days, 0)
    except ValueError:
        return 0


def _log(db, project_id: int, message: str, log_type: str) -> None:
    db.execute("INSERT INTO activity_logs (project_id, message, type) VALUES (?, ?, ?)", (project_id, message, log_type))
