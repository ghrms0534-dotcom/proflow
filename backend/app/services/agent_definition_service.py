from contextlib import closing

from app.common import database


def list_agents() -> list[dict]:
    with closing(database.connect()) as db:
        rows = db.execute("SELECT * FROM agent_definitions WHERE enabled = 1 ORDER BY sort_order, id").fetchall()
        return [_serialize(row) for row in rows]


def get_agent(agent_key: str) -> dict | None:
    with closing(database.connect()) as db:
        row = db.execute("SELECT * FROM agent_definitions WHERE agent_key = ? AND enabled = 1", (agent_key,)).fetchone()
        return _serialize(row) if row else None


def _serialize(row) -> dict:
    result = dict(row)
    result["enabled"] = bool(result["enabled"])
    return result
