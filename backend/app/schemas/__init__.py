from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse, UserUpdate
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskProgressUpdate, TaskDependencyResponse
from app.schemas.inbox import InboxExtractRequest, ExtractedTaskItem, InboxExtractResponse, InboxConfirmRequest
from app.schemas.schedule import (
    PlanGenerateRequest,
    ReplanRequest,
    ScheduleBlockResponse,
    ScheduleResponse,
    StudySessionCreate,
    StudySessionResponse,
)
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse, GoalGenerateMilestonesRequest
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectMemberCreate,
    ProjectMemberResponse,
    ProjectTaskCreate,
    ProjectTaskUpdate,
    ProjectTaskResponse,
)
from app.schemas.document import DocumentResponse, DocumentChunkResponse, RAGQueryRequest, RAGQueryResponse, SourceCitation
from app.schemas.analytics import AnalyticsResponse, SubjectAnalytics, WorkloadDay, AccuracyMetric, AIInsightItem
from app.schemas.preferences import StudentPreferenceUpdate, StudentPreferenceResponse, LLMConfigSettings

__all__ = [
    "UserRegister", "UserLogin", "Token", "UserResponse", "UserUpdate",
    "CourseCreate", "CourseUpdate", "CourseResponse",
    "TaskCreate", "TaskUpdate", "TaskResponse", "TaskProgressUpdate", "TaskDependencyResponse",
    "InboxExtractRequest", "ExtractedTaskItem", "InboxExtractResponse", "InboxConfirmRequest",
    "PlanGenerateRequest", "ReplanRequest", "ScheduleBlockResponse", "ScheduleResponse",
    "StudySessionCreate", "StudySessionResponse",
    "GoalCreate", "GoalUpdate", "GoalResponse", "GoalGenerateMilestonesRequest",
    "ProjectCreate", "ProjectUpdate", "ProjectResponse", "ProjectMemberCreate", "ProjectMemberResponse",
    "ProjectTaskCreate", "ProjectTaskUpdate", "ProjectTaskResponse",
    "DocumentResponse", "DocumentChunkResponse", "RAGQueryRequest", "RAGQueryResponse", "SourceCitation",
    "AnalyticsResponse", "SubjectAnalytics", "WorkloadDay", "AccuracyMetric", "AIInsightItem",
    "StudentPreferenceUpdate", "StudentPreferenceResponse", "LLMConfigSettings",
]
