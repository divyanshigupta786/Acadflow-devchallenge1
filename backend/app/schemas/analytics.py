from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class WorkloadDay(BaseModel):
    day: str
    estimated_hours: float
    actual_hours: float


class SubjectAnalytics(BaseModel):
    course_name: str
    course_code: str
    color: str
    completed_tasks: int
    pending_tasks: int
    progress_percentage: float
    total_hours_spent: float


class AccuracyMetric(BaseModel):
    category: str
    estimated_avg_mins: float
    actual_avg_mins: float
    ratio: float  # e.g., 1.3 means 30% longer than planned


class AIInsightItem(BaseModel):
    id: str
    type: str  # pattern, warning, recommendation, positive
    title: str
    description: str
    evidence: str


class AnalyticsResponse(BaseModel):
    completion_rate_percentage: float
    total_tasks_completed: int
    total_tasks_pending: int
    total_tasks_overdue: int
    total_study_hours: float
    weekly_workload: List[WorkloadDay]
    subject_distribution: List[SubjectAnalytics]
    estimation_accuracy: List[AccuracyMetric]
    ai_insights: List[AIInsightItem]
    most_productive_time_window: str
