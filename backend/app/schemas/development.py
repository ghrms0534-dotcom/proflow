from typing import Any

from pydantic import BaseModel, Field


class DevelopmentContext(BaseModel):
    task_id: str | None = None
    files: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)
