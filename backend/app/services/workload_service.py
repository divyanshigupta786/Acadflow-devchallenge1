from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.task import Task
from app.models.user import StudentPreference


class WorkloadService:
    @staticmethod
    def estimate_initial_workload(
        task_type: str,
        title: str,
        difficulty: str = "medium",
        user_preference: Optional[StudentPreference] = None
    ) -> Dict[str, Any]:
        """
        Calculates baseline workload and applies personalized multiplier.
        """
        title_lower = title.lower()
        type_upper = (task_type or "ASSIGNMENT").upper()

        # Baseline minutes by academic type
        if "EXAM" in type_upper or "MIDTERM" in type_upper or "FINAL" in type_upper:
            base_minutes = 180  # 3 hours preparation
        elif "QUIZ" in type_upper or "VIVA" in type_upper:
            base_minutes = 90
        elif "PROJECT" in type_upper:
            base_minutes = 240
        elif "LAB" in type_upper:
            base_minutes = 120
        elif "PRESENTATION" in type_upper:
            base_minutes = 90
        elif "REVISION" in type_upper:
            base_minutes = 60
        elif "READING" in type_upper:
            base_minutes = 45
        else:
            base_minutes = 90

        # Adjust for difficulty
        diff_lower = (difficulty or "medium").lower()
        if diff_lower == "hard":
            base_minutes = int(base_minutes * 1.4)
        elif diff_lower == "easy":
            base_minutes = int(base_minutes * 0.75)

        # Apply personalized historical multipliers from student preferences
        multiplier = 1.0
        if user_preference:
            is_coding = any(k in title_lower for k in ["code", "programming", "implementation", "algorithm", "dsa", "backend", "dbms", "sql"])
            if is_coding and user_preference.programming_task_multiplier:
                multiplier = user_preference.programming_task_multiplier

        final_estimated = int(base_minutes * multiplier)

        return {
            "estimated_minutes": final_estimated,
            "remaining_minutes": final_estimated,
            "confidence_score": 0.85 if multiplier == 1.0 else 0.92,
            "is_inferred": True,
            "applied_multiplier": multiplier
        }

    @staticmethod
    def record_task_completion(
        db: Session,
        task: Task,
        user_id: str
    ):
        """
        Learns from completed tasks to update personalized multipliers.
        """
        if task.estimated_minutes <= 0 or task.actual_minutes <= 0:
            return

        ratio = task.actual_minutes / float(task.estimated_minutes)

        pref = db.query(StudentPreference).filter(StudentPreference.user_id == user_id).first()
        if not pref:
            return

        title_lower = task.title.lower()
        is_coding = any(k in title_lower for k in ["code", "programming", "implementation", "algorithm", "dsa", "backend", "dbms", "sql"])

        if is_coding:
            # Smoothly adapt programming multiplier with exponential moving average
            current_mult = pref.programming_task_multiplier or 1.3
            new_mult = round(0.7 * current_mult + 0.3 * ratio, 2)
            pref.programming_task_multiplier = max(0.8, min(2.5, new_mult))
            db.commit()
