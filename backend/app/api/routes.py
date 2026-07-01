from fastapi import APIRouter

from app.api.agent_routes import catalog_router, router as agent_router
from app.api.auth_routes import router as auth_router
from app.api.project_routes import router as project_router

router = APIRouter()


router.include_router(auth_router)
router.include_router(project_router)
router.include_router(agent_router)
router.include_router(catalog_router)
