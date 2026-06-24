import sqlite3

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from . import auth, database, schemas

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def user_payload(row: sqlite3.Row) -> dict:
    return {"id": row["id"], "email": row["email"], "name": row["name"], "role": row["role"]}


async def get_current_user(token: str = Depends(oauth2_scheme), db: sqlite3.Connection = Depends(database.get_db)) -> sqlite3.Row:
    payload = auth.decode_access_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.execute("SELECT * FROM users WHERE id = ?", (payload["sub"],)).fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/auth/login")
async def login(req: schemas.LoginRequest, db: sqlite3.Connection = Depends(database.get_db)):
    user = db.execute("SELECT * FROM users WHERE email = ?", (req.email,)).fetchone()
    if not user or not auth.verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    return {
        "access_token": auth.create_access_token({"sub": user["id"]}),
        "token_type": "bearer",
        "user": user_payload(user),
    }


@router.post("/auth/register")
async def register(req: schemas.UserCreate, db: sqlite3.Connection = Depends(database.get_db)):
    try:
        cursor = db.execute(
            "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)",
            (req.email, auth.get_password_hash(req.password), req.name, req.role),
        )
        db.commit()
    except sqlite3.IntegrityError as exc:
        raise HTTPException(status_code=400, detail="Email already registered") from exc

    user = db.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return user_payload(user)


@router.get("/projects")
async def get_projects(current_user: sqlite3.Row = Depends(get_current_user), db: sqlite3.Connection = Depends(database.get_db)):
    rows = db.execute(
        """
        SELECT p.*
        FROM projects p
        JOIN project_members pm ON pm.project_id = p.id
        WHERE pm.user_id = ?
        ORDER BY p.id
        """,
        (current_user["id"],),
    ).fetchall()
    return [dict(row) for row in rows]


@router.get("/projects/{project_id}/dashboard")
async def get_dashboard(project_id: int, current_user: sqlite3.Row = Depends(get_current_user), db: sqlite3.Connection = Depends(database.get_db)):
    require_member(project_id, current_user["id"], db)
    project = db.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    variants = {
        1: (64, 164, 104, "OO 금융그룹", [72, 41, 12]),
        2: (40, 120, 50, "내부 업무팀", [50, 30, 10]),
        3: (15, 90, 14, "데이터랩", [25, 12, 5]),
    }
    progress, total, completed, customer, stage_progress = variants.get(project_id, variants[1])

    return {
        "overall_progress": progress,
        "total_tasks": total,
        "completed_tasks": completed,
        "stages": [
            {"name": "분석 및 설계", "progress": stage_progress[0], "completed": 28, "total": 39},
            {"name": "개발 및 테스트", "progress": stage_progress[1], "completed": 32, "total": 78},
            {"name": "검증 및 산출", "progress": stage_progress[2], "completed": 14, "total": 116},
        ],
        "project_info": {
            "name": project["name"],
            "customer": customer,
            "pm": current_user["name"],
            "period": f"{project['start_date']} ~ {project['end_date']}",
            "base_date": "2026-06-24",
        },
        "major_tasks": [
            {"no": 1, "name": "요구사항 정리", "assignee": current_user["name"], "status": "Completed", "start": "2026-06-01", "end": "2026-06-07", "priority": "High"},
            {"no": 2, "name": "WBS 확정", "assignee": current_user["name"], "status": "Waiting", "start": "2026-06-08", "end": "2026-06-12", "priority": "Medium"},
        ],
    }


@router.get("/projects/{project_id}/activities")
async def get_activities(project_id: int, current_user: sqlite3.Row = Depends(get_current_user), db: sqlite3.Connection = Depends(database.get_db)):
    require_member(project_id, current_user["id"], db)
    rows = db.execute(
        "SELECT * FROM activity_logs WHERE project_id = ? ORDER BY created_at DESC",
        (project_id,),
    ).fetchall()
    return [dict(row) for row in rows]


def require_member(project_id: int, user_id: int, db: sqlite3.Connection) -> None:
    member = db.execute(
        "SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?",
        (project_id, user_id),
    ).fetchone()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this project")
