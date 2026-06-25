from pydantic import BaseModel


class DashboardSummary(BaseModel):
    progress: int
    total_tasks: int
    completed_tasks: int
    days_left: int
    risk_level: str
    client: str


class StageProgress(BaseModel):
    name: str
    progress: int
    status: str


class TaskItem(BaseModel):
    no: int
    name: str
    owner: str
    status: str
    due_date: str


class AiRecommendation(BaseModel):
    title: str
    priority: str
    message: str


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    stages: list[StageProgress]
    major_tasks: list[TaskItem]
    ai_recommendations: list[AiRecommendation]
