from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date


class ScheduleBlockBase(BaseModel):
    title: str
    subject_name: Optional[str] = None
    task_id: Optional[str] = None
    start_time: str
    end_time: str
    duration_minutes: int
    priority: str = "MEDIUM"
    is_completed: bool = False
    is_break: bool = False
    plan_version: str = "current"
    original_start_time: Optional[str] = None
    revised_reason: Optional[str] = None


class ScheduleBlockResponse(ScheduleBlockBase):
    id: str
    user_id: str
    plan_date: date
    created_at: datetime

    class Config:
        from_attributes = True


class PlanGenerateRequest(BaseModel):
    available_hours: float = 3.0
    plan_date: Optional[date] = None
    start_time: str = "10:00"
    include_breaks: bool = True
    preferred_session_minutes: int = 45


class ReplanRequest(BaseModel):
    # E.g.: "I only completed 45 minutes of DBMS", "I lost 2 hours today"
    reason: str
    affected_task_id: Optional[str] = None
    minutes_completed: Optional[int] = None
    hours_lost: Optional[float] = None
    remaining_available_hours: Optional[float] = None


class ScheduleResponse(BaseModel):
    plan_date: str
    available_hours: float
    total_study_minutes: int
    blocks: List[ScheduleBlockResponse]
    ai_explanation: str
    moved_tasks: List[str] = []
    preserved_tasks: List[str] = []
    is_replanned: bool = False


class StudySessionCreate(BaseModel):
    task_id: Optional[str] = None
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    focus_rating: int = 5
    notes: Optional[str] = None


class StudySessionResponse(StudySessionCreate):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True
