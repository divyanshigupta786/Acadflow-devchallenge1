from pydantic import BaseModel
from typing import Optional, List


class StudentPreferenceBase(BaseModel):
    preferred_study_duration: int = 45
    break_duration: int = 15
    preferred_study_time: str = "morning"
    available_daily_hours: float = 4.0
    strong_subjects: List[str] = []
    weak_subjects: List[str] = []
    programming_task_multiplier: float = 1.3
    reading_task_multiplier: float = 1.0


class StudentPreferenceUpdate(BaseModel):
    preferred_study_duration: Optional[int] = None
    break_duration: Optional[int] = None
    preferred_study_time: Optional[str] = None
    available_daily_hours: Optional[float] = None
    strong_subjects: Optional[List[str]] = None
    weak_subjects: Optional[List[str]] = None
    programming_task_multiplier: Optional[float] = None
    reading_task_multiplier: Optional[float] = None


class StudentPreferenceResponse(StudentPreferenceBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True


class LLMConfigSettings(BaseModel):
    provider: str = "ollama"
    model: str = "qwen2.5:7b"
    ollama_base_url: str = "http://localhost:11434"
    status: str = "ready"
    active_model_details: Optional[str] = None
