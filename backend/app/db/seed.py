import sqlite3

from backend.app.core import auth


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

    db.commit()
