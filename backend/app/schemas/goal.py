from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "Academic"
    target_date: Optional[datetime] = None
    progress: int = 0
    milestones: List[Dict[str, Any]] = []


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    target_date: Optional[datetime] = None
    progress: Optional[int] = None
    milestones: Optional[List[Dict[str, Any]]] = None


class GoalGenerateMilestonesRequest(BaseModel):
    goal_title: str
    target_weeks: int = 8
    target_level: str = "Beginner to Intermediate"


class GoalResponse(GoalBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
