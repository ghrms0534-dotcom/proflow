from fastapi import APIRouter, Depends, HTTPException

from app.api.auth_routes import get_current_user
from app.common.exceptions import ProjectAccessError
from app.schemas.agent import OrchestrationRequest, OrchestrationResponse
from app.services.agent_run_service import orchestrate

router = APIRouter(prefix="/project-control", tags=["Project Control"])


@router.post("/orchestrate", response_model=OrchestrationResponse)
def run_orchestration(payload: OrchestrationRequest, current_user=Depends(get_current_user)):
    try:
        return orchestrate(payload, current_user["id"])
    except ProjectAccessError as error:
        raise HTTPException(status_code=403, detail=str(error)) from error
