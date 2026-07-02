from contextlib import closing

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from app.common import database
from app.common.exceptions import AgentNotFoundError, ProjectAccessError
from app.core import auth
from app.schemas.agent import AgentChatRequest, AgentChatResponse, AgentRunRequest, AgentRunResponse
from app.services.agent_definition_service import get_agent, list_agents
from app.services.agent_run_service import chat, run_agent

router = APIRouter(prefix="/agent", tags=["Agent"])
catalog_router = APIRouter(prefix="/agents", tags=["Agent"])
optional_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def optional_user_id(token: str | None = Depends(optional_oauth2)) -> int | None:
    payload = auth.decode_access_token(token) if token else None
    if not payload or not payload.get("sub"):
        return None
    with closing(database.connect()) as db:
        user = db.execute("SELECT id FROM users WHERE id = ?", (payload["sub"],)).fetchone()
        return user["id"] if user else None


@catalog_router.get("")
def agents():
    return {"agents": list_agents()}


@catalog_router.get("/{agent_key}")
def agent_detail(agent_key: str):
    agent = get_agent(agent_key)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"agent": agent}


@catalog_router.post("/run", response_model=AgentRunResponse)
def run(payload: AgentRunRequest, user_id: int | None = Depends(optional_user_id)):
    if user_id is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        return run_agent(payload, user_id)
    except ProjectAccessError as error:
        raise HTTPException(status_code=403, detail=str(error)) from error


@router.post("/chat", response_model=AgentChatResponse)
def agent_chat(payload: AgentChatRequest, user_id: int | None = Depends(optional_user_id)):
    if payload.agent == "project_control" and user_id is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        return chat(payload, user_id)
    except AgentNotFoundError as error:
        raise HTTPException(status_code=404, detail=f"Unknown agent: {error}") from error
    except ProjectAccessError as error:
        raise HTTPException(status_code=403, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
