from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TaskDependencyResponse(BaseModel):
    id: str
    task_id: str
    depends_on_task_id: str
    is_blocker: bool
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    course_id: Optional[str] = None
    task_type: str = "Assignment"
    deadline: Optional[datetime] = None  # None if not explicit! Zero hallucinations
    estimated_minutes: int = 60
    remaining_minutes: Optional[int] = None
    actual_minutes: int = 0
    confidence_score: float = 0.8
    priority: str = "MEDIUM"
    progress: int = 0
    status: str = "pending"
    difficulty: str = "medium"
    is_inferred: bool = False
    topics: List[str] = []
    requirements: List[str] = []


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    course_id: Optional[str] = None
    task_type: Optional[str] = None
    deadline: Optional[datetime] = None
    estimated_minutes: Optional[int] = None
    remaining_minutes: Optional[int] = None
    actual_minutes: Optional[int] = None
    confidence_score: Optional[float] = None
    priority: Optional[str] = None
    progress: Optional[int] = None
    status: Optional[str] = None
    difficulty: Optional[str] = None
    topics: Optional[List[str]] = None
    requirements: Optional[List[str]] = None


class TaskProgressUpdate(BaseModel):
    progress: Optional[int] = None
    minutes_spent: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class TaskResponse(TaskBase):
    id: str
    user_id: str
    remaining_minutes: int
    priority_score: float
    priority_explanation: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    course_name: Optional[str] = None
    course_color: Optional[str] = None
    dependencies: List[TaskDependencyResponse] = []

    class Config:
        from_attributes = True
