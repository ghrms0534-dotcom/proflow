from pydantic import BaseModel


class DashboardSummary(BaseModel):
    progress: int
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    waiting_tasks: int
    days_left: int
    risk_level: str
    client: str


class StageProgress(BaseModel):
    name: str
    progress: int
    status: str
    completed: int
    in_progress: int
    waiting: int


class TaskItem(BaseModel):
    no: int
    name: str
    owner: str
    status: str
    due_date: str
    stage: str
    priority: str


class RecentActivity(BaseModel):
    id: int
    message: str
    type: str
    created_at: str


class ProjectInfo(BaseModel):
    name: str
    customer: str
    pm: str
    period: str
    base_date: str


class AiRecommendation(BaseModel):
    title: str
    priority: str
    message: str


class PlanningAgentProgress(BaseModel):
    completed_count: int
    total_count: int
    progress: int
    latest_agent: str | None
    last_run_at: str | None
    has_failure: bool


class OrchestrationStatus(BaseModel):
    id: int | None
    status: str
    completed_steps: int
    total_steps: int
    failed_steps: list[str]
    last_run_at: str | None


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    stages: list[StageProgress]
    major_tasks: list[TaskItem]
    ai_recommendations: list[AiRecommendation]
    recent_activities: list[RecentActivity]
    project_info: ProjectInfo
    planning_agent: PlanningAgentProgress
    development_agent: PlanningAgentProgress
    delivery_agent: PlanningAgentProgress
    lifecycle: PlanningAgentProgress
    system_agent: PlanningAgentProgress
    orchestration: OrchestrationStatus
