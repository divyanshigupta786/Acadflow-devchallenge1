from datetime import datetime, date
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.course import Course
from app.models.schedule import ScheduleBlock
from app.models.user import StudentPreference
from app.services.priority_service import PriorityEngine
from app.services.schedule_service import ScheduleService
from app.services.workload_service import WorkloadService
from app.ai.rag.retriever import RAGRetriever


class AgentTools:
    """
    Controlled backend tools for AI agent.
    All operations are strictly validated through application services.
    """

    @staticmethod
    def get_tasks(db: Session, user_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
        q = db.query(Task).filter(Task.user_id == user_id)
        if status:
            q = q.filter(Task.status == status)
        tasks = q.all()
        return [
            {
                "id": t.id,
                "title": t.title,
                "course": t.course.name if t.course else None,
                "task_type": t.task_type,
                "deadline": t.deadline.isoformat() if t.deadline else None,
                "priority": t.priority,
                "priority_score": t.priority_score,
                "progress": t.progress,
                "remaining_minutes": t.remaining_minutes,
                "status": t.status,
            }
            for t in tasks
        ]

    @staticmethod
    def get_deadlines(db: Session, user_id: str) -> List[Dict[str, Any]]:
        tasks = (
            db.query(Task)
            .filter(Task.user_id == user_id, Task.deadline.isnot(None), Task.status != "completed")
            .order_by(Task.deadline.asc())
            .all()
        )
        return [
            {
                "task_id": t.id,
                "title": t.title,
                "course": t.course.name if t.course else None,
                "deadline": t.deadline.isoformat(),
                "priority": t.priority,
                "remaining_minutes": t.remaining_minutes,
            }
            for t in tasks
        ]

    @staticmethod
    def get_student_preferences(db: Session, user_id: str) -> Dict[str, Any]:
        pref = db.query(StudentPreference).filter(StudentPreference.user_id == user_id).first()
        if not pref:
            return {"available_daily_hours": 4.0, "preferred_study_duration": 45}
        return {
            "available_daily_hours": pref.available_daily_hours,
            "preferred_study_duration": pref.preferred_study_duration,
            "strong_subjects": pref.strong_subjects,
            "weak_subjects": pref.weak_subjects,
            "programming_multiplier": pref.programming_task_multiplier,
        }

    @staticmethod
    def create_daily_plan(db: Session, user_id: str, hours: float = 3.0) -> Dict[str, Any]:
        return ScheduleService.generate_daily_schedule(db=db, user_id=user_id, available_hours=hours)

    @staticmethod
    def adaptively_replan(db: Session, user_id: str, reason: str, hours_lost: Optional[float] = None) -> Dict[str, Any]:
        return ScheduleService.adaptively_replan(db=db, user_id=user_id, reason=reason, hours_lost=hours_lost)

    @staticmethod
    async def search_knowledge(db: Session, user_id: str, query: str) -> Dict[str, Any]:
        res = await RAGRetriever.query_knowledge_base(db=db, user_id=user_id, query=query)
        return {"answer": res.answer, "citations": [c.dict() for c in res.citations]}
