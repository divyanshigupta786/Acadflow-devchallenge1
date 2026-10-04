from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class InboxExtractRequest(BaseModel):
    raw_text: str
    source_type: str = "text"  # "text", "voice", "screenshot", "pdf"


class ExtractedTaskItem(BaseModel):
    title: str
    subject_name: Optional[str] = None
    course_id: Optional[str] = None
    task_type: str = "Assignment"
    
    # Anti-hallucination requirement:
    # Explicitly null if not stated in text. Never invent dates!
    deadline: Optional[datetime] = None
    deadline_raw_text: Optional[str] = None
    is_deadline_ambiguous: bool = False
    ambiguity_explanation: Optional[str] = None
    
    topics: List[str] = []
    requirements: List[str] = []
    estimated_minutes: int = 60
    is_workload_inferred: bool = True
    priority: str = "MEDIUM"
    confidence_score: float = 0.85
    notes: Optional[str] = None


class InboxExtractResponse(BaseModel):
    extracted_tasks: List[ExtractedTaskItem]
    raw_input: str
    source_type: str
    ai_provider: str
    ai_model: str
    processing_time_ms: float
    confidence_summary: str


class InboxConfirmRequest(BaseModel):
    tasks: List[ExtractedTaskItem]
