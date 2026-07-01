from pydantic import BaseModel, Field


class ProjectSummary(BaseModel):
    id: int
    name: str
    status: str


class RequirementCreate(BaseModel):
    requirement_key: str = Field(min_length=1, max_length=100)
    title: str = Field(min_length=1, max_length=300)
    status: str = "planned"
    priority: str = "MEDIUM"
    owner: str = ""


class RequirementUpdate(BaseModel):
    requirement_key: str | None = Field(default=None, min_length=1, max_length=100)
    title: str | None = Field(default=None, min_length=1, max_length=300)
    status: str | None = None
    priority: str | None = None
    owner: str | None = None


class DevelopmentTaskCreate(BaseModel):
    task_key: str = Field(min_length=1, max_length=100)
    title: str = Field(min_length=1, max_length=300)
    status: str = "planned"
    priority: str = "MEDIUM"
    owner: str = ""


class DevelopmentTaskUpdate(BaseModel):
    task_key: str | None = Field(default=None, min_length=1, max_length=100)
    title: str | None = Field(default=None, min_length=1, max_length=300)
    status: str | None = None
    priority: str | None = None
    owner: str | None = None


class QualityResultCreate(BaseModel):
    result_key: str = Field(min_length=1, max_length=100)
    title: str = Field(min_length=1, max_length=300)
    status: str = "pending"
    score: int = Field(default=0, ge=0, le=100)
    risk_level: str = "WARN"


class QualityResultUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    status: str | None = None
    score: int | None = Field(default=None, ge=0, le=100)
    risk_level: str | None = None


class PlanningItemCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    status: str = "planned"
    priority: str = "MEDIUM"
    owner: str = ""


class PlanningItemUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    status: str | None = None
    priority: str | None = None
    owner: str | None = None


class ScheduleCreate(PlanningItemCreate):
    schedule_key: str = Field(min_length=1, max_length=100)


class ScheduleUpdate(PlanningItemUpdate):
    schedule_key: str | None = Field(default=None, min_length=1, max_length=100)


class WbsCreate(PlanningItemCreate):
    wbs_key: str = Field(min_length=1, max_length=100)


class WbsUpdate(PlanningItemUpdate):
    wbs_key: str | None = Field(default=None, min_length=1, max_length=100)


class DesignCreate(PlanningItemCreate):
    design_key: str = Field(min_length=1, max_length=100)


class DesignUpdate(PlanningItemUpdate):
    design_key: str | None = Field(default=None, min_length=1, max_length=100)


class UnitTestCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    target_module: str = ""
    status: str = "planned"
    pass_count: int = Field(default=0, ge=0)
    fail_count: int = Field(default=0, ge=0)
    coverage: int = Field(default=0, ge=0, le=100)
    owner: str = ""
    memo: str = ""


class UnitTestUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    target_module: str | None = None
    status: str | None = None
    pass_count: int | None = Field(default=None, ge=0)
    fail_count: int | None = Field(default=None, ge=0)
    coverage: int | None = Field(default=None, ge=0, le=100)
    owner: str | None = None
    memo: str | None = None


class IntegrationTestCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    target_scope: str = ""
    status: str = "planned"
    scenario_count: int = Field(default=0, ge=0)
    passed_scenarios: int = Field(default=0, ge=0)
    failed_scenarios: int = Field(default=0, ge=0)
    owner: str = ""
    memo: str = ""


class IntegrationTestUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    target_scope: str | None = None
    status: str | None = None
    scenario_count: int | None = Field(default=None, ge=0)
    passed_scenarios: int | None = Field(default=None, ge=0)
    failed_scenarios: int | None = Field(default=None, ge=0)
    owner: str | None = None
    memo: str | None = None


class CodeReviewCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    repository: str = ""
    branch: str = ""
    reviewer: str = ""
    status: str = "planned"
    issue_count: int = Field(default=0, ge=0)
    resolved_count: int = Field(default=0, ge=0)
    memo: str = ""


class CodeReviewUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    repository: str | None = None
    branch: str | None = None
    reviewer: str | None = None
    status: str | None = None
    issue_count: int | None = Field(default=None, ge=0)
    resolved_count: int | None = Field(default=None, ge=0)
    memo: str | None = None


class DeploymentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    environment: str = ""
    version: str = ""
    status: str = "planned"
    deployed_at: str | None = None
    owner: str = ""
    memo: str = ""


class DeploymentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    environment: str | None = None
    version: str | None = None
    status: str | None = None
    deployed_at: str | None = None
    owner: str | None = None
    memo: str | None = None


class DefectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    severity: str = "MEDIUM"
    status: str = "open"
    source: str = ""
    owner: str = ""
    detected_at: str | None = None
    resolved_at: str | None = None
    memo: str = ""


class DefectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    severity: str | None = None
    status: str | None = None
    source: str | None = None
    owner: str | None = None
    detected_at: str | None = None
    resolved_at: str | None = None
    memo: str | None = None


class DocumentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    document_type: str = ""
    version: str = ""
    status: str = "planned"
    owner: str = ""
    file_name: str = ""
    file_path: str = ""
    memo: str = ""


class DocumentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    document_type: str | None = None
    version: str | None = None
    status: str | None = None
    owner: str | None = None
    file_name: str | None = None
    file_path: str | None = None
    memo: str | None = None


class OutputCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    output_type: str = ""
    version: str = ""
    status: str = "planned"
    owner: str = ""
    submitted_at: str | None = None
    approved_at: str | None = None
    memo: str = ""


class OutputUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    output_type: str | None = None
    version: str | None = None
    status: str | None = None
    owner: str | None = None
    submitted_at: str | None = None
    approved_at: str | None = None
    memo: str | None = None
