from app.models.user import User, StudentPreference, AIMemory
from app.models.course import Course
from app.models.task import Task, TaskDependency
from app.models.schedule import ScheduleBlock, StudySession
from app.models.goal import Goal
from app.models.project import Project, ProjectMember, ProjectTask
from app.models.document import Document, DocumentChunk
from app.models.notification import Notification

__all__ = [
    "User",
    "StudentPreference",
    "AIMemory",
    "Course",
    "Task",
    "TaskDependency",
    "ScheduleBlock",
    "StudySession",
    "Goal",
    "Project",
    "ProjectMember",
    "ProjectTask",
    "Document",
    "DocumentChunk",
    "Notification",
]
