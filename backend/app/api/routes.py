import sqlite3

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from backend.app import schemas
from backend.app.core import auth
from backend.app.db import database

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def user_payload(user: sqlite3.Row) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
    }


def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = auth.decode_access_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid token")

    with database.connect() as db:
        user = db.execute("SELECT * FROM users WHERE id = ?", (payload.get("sub"),)).fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user


@router.post("/auth/login")
def login(payload: schemas.LoginRequest):
    with database.connect() as db:
        user = db.execute("SELECT * FROM users WHERE email = ?", (payload.email,)).fetchone()
        if not user or not auth.verify_password(payload.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = auth.create_access_token({"sub": user["id"], "email": user["email"]})
        return {"access_token": token, "token_type": "bearer", "user": user_payload(user)}


@router.post("/auth/register")
def register(payload: schemas.UserCreate):
    with database.connect() as db:
        if db.execute("SELECT 1 FROM users WHERE email = ?", (payload.email,)).fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        cursor = db.execute(
            "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)",
            (payload.email, auth.get_password_hash(payload.password), payload.name, payload.role),
        )
        db.commit()
        user = db.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
        token = auth.create_access_token({"sub": user["id"], "email": user["email"]})
        return {"access_token": token, "token_type": "bearer", "user": user_payload(user)}


@router.get("/projects")
def list_projects(current_user=Depends(get_current_user)):
    with database.connect() as db:
        rows = db.execute(
            """
            SELECT p.*, pm.role AS member_role
            FROM projects p
            JOIN project_members pm ON pm.project_id = p.id
            WHERE pm.user_id = ?
            ORDER BY p.id
            """,
            (current_user["id"],),
        ).fetchall()
        return {"projects": [dict(row) for row in rows]}


@router.get("/projects/{project_id}/dashboard", response_model=schemas.DashboardResponse)
def dashboard(project_id: int, current_user=Depends(get_current_user)):
    require_member(project_id, current_user["id"])

    variants = {
        1: (64, 164, 104, "Finance Group", [72, 41, 12]),
        2: (40, 120, 50, "Internal Ops", [50, 30, 10]),
        3: (15, 90, 14, "Data Portal", [25, 12, 5]),
    }
    progress, total_tasks, completed_tasks, client, stage_values = variants.get(
        project_id, variants[1]
    )

    return {
        "summary": {
            "progress": progress,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "days_left": 45,
            "risk_level": "WARN" if progress < 50 else "SAFE",
            "client": client,
        },
        "stages": [
            {"name": "Analysis and Design", "progress": stage_values[0], "status": "In Progress"},
            {"name": "Development and Test", "progress": stage_values[1], "status": "In Progress"},
            {"name": "Validation and Delivery", "progress": stage_values[2], "status": "Pending"},
        ],
        "major_tasks": [
            {"no": 1, "name": "Requirements Review", "owner": "PM", "status": "In Progress", "due_date": "2026-07-10"},
            {"no": 2, "name": "WBS Baseline", "owner": "PL", "status": "Done", "due_date": "2026-07-05"},
        ],
        "ai_recommendations": [
            {
                "title": "Requirement Traceability",
                "priority": "HIGH",
                "message": "Requirement-to-test coverage is below the project target.",
            },
            {
                "title": "Schedule Risk",
                "priority": "MEDIUM",
                "message": "Some development tasks are behind the baseline schedule.",
            },
        ],
    }


@router.get("/projects/{project_id}/activities")
def activities(project_id: int, current_user=Depends(get_current_user)):
    require_member(project_id, current_user["id"])

    with database.connect() as db:
        rows = db.execute(
            "SELECT * FROM activity_logs WHERE project_id = ? ORDER BY created_at DESC LIMIT 20",
            (project_id,),
        ).fetchall()
        return {"activities": [dict(row) for row in rows]}


def require_member(project_id: int, user_id: int) -> None:
    with database.connect() as db:
        if not db.execute(
            "SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?",
            (project_id, user_id),
        ).fetchone():
            raise HTTPException(status_code=403, detail="Project access denied")
