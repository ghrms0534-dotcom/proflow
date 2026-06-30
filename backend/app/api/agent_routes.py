from fastapi import APIRouter, HTTPException

from app.common.exceptions import AgentNotFoundError
from app.schemas.agent import AgentChatRequest, AgentChatResponse
from app.services.agent_run_service import chat

router = APIRouter(prefix="/agent", tags=["Agent"])


@router.post("/chat", response_model=AgentChatResponse)
def agent_chat(payload: AgentChatRequest):
    try:
        return chat(payload)
    except AgentNotFoundError as error:
        raise HTTPException(status_code=404, detail=f"Unknown agent: {error}") from error
