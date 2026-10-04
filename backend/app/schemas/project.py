from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ProjectMemberBase(BaseModel):
    name: str
    role: str
    email: Optional[str] = None


class ProjectMemberCreate(ProjectMemberBase):
    pass


class ProjectMemberResponse(ProjectMemberBase):
    id: str
    project_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectTaskBase(BaseModel):
    title: str
    assignee_name: Optional[str] = None
    status: str = "todo"
    deadline: Optional[datetime] = None
    is_blocked: bool = False
    blocker_reason: Optional[str] = None
    blocked_by_task_title: Optional[str] = None


class ProjectTaskCreate(ProjectTaskBase):
    pass


class ProjectTaskUpdate(BaseModel):
    title: Optional[str] = None
    assignee_name: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[datetime] = None
    is_blocked: Optional[bool] = None
    blocker_reason: Optional[str] = None
    blocked_by_task_title: Optional[str] = None


class ProjectTaskResponse(ProjectTaskBase):
    id: str
    project_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    status: str = "active"


class ProjectCreate(ProjectBase):
    members: List[ProjectMemberCreate] = []
    tasks: List[ProjectTaskCreate] = []


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    members: List[ProjectMemberResponse] = []
    project_tasks: List[ProjectTaskResponse] = []
    active_blockers_count: int = 0

    class Config:
        from_attributes = True
