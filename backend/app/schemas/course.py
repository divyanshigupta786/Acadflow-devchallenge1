from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CourseBase(BaseModel):
    name: str
    code: str
    instructor: Optional[str] = None
    color: str = "#3b82f6"
    semester: str = "Current"
    credits: int = 3
    syllabus_topics: List[str] = []
    strong_areas: List[str] = []
    weak_areas: List[str] = []


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    instructor: Optional[str] = None
    color: Optional[str] = None
    semester: Optional[str] = None
    credits: Optional[int] = None
    progress: Optional[float] = None
    syllabus_topics: Optional[List[str]] = None
    strong_areas: Optional[List[str]] = None
    weak_areas: Optional[List[str]] = None


class CourseResponse(CourseBase):
    id: str
    user_id: str
    progress: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
