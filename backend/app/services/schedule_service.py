from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.schedule import ScheduleBlock
from app.models.user import StudentPreference
from app.services.priority_service import PriorityEngine


class ScheduleService:
    @staticmethod
    def _parse_time(time_str: str) -> Tuple[int, int]:
        parts = time_str.split(":")
        return int(parts[0]), int(parts[1])

    @staticmethod
    def _format_time(hour: int, minute: int) -> str:
        return f"{hour:02d}:{minute:02d}"

    @staticmethod
    def _add_minutes_to_time(time_str: str, minutes: int) -> str:
        h, m = ScheduleService._parse_time(time_str)
        total_m = h * 60 + m + minutes
        end_h = (total_m // 60) % 24
        end_m = total_m % 60
        return ScheduleService._format_time(end_h, end_m)

    @classmethod
    def generate_daily_schedule(
        cls,
        db: Session,
        user_id: str,
        available_hours: float = 3.0,
        plan_date: Optional[date] = None,
        start_time: str = "10:00",
        include_breaks: bool = True,
        preferred_session_minutes: int = 45,
    ) -> Dict[str, Any]:
        if plan_date is None:
            plan_date = date.today()

        # Retrieve user preferences for session and break lengths
        pref = db.query(StudentPreference).filter(StudentPreference.user_id == user_id).first()
        session_mins = pref.preferred_study_duration if pref else preferred_session_minutes
        break_mins = pref.break_duration if pref else 15

        # Fetch active tasks for user (not completed, with remaining minutes > 0)
        tasks = (
            db.query(Task)
            .filter(
                Task.user_id == user_id,
                Task.status.in_(["pending", "in_progress"]),
                Task.remaining_minutes > 0
            )
            .all()
        )

        # Recalculate priority scores dynamically to ensure fresh ranking
        for t in tasks:
            has_exam = any("EXAM" in (other.task_type or "").upper() and other.course_id == t.course_id for other in tasks)
            blocks_count = len(t.blocked_by)
            p_label, p_score, p_exp = PriorityEngine.calculate_task_priority(
                title=t.title,
                task_type=t.task_type,
                deadline=t.deadline,
                remaining_minutes=t.remaining_minutes,
                progress=t.progress,
                blocks_count=blocks_count,
                has_upcoming_exam=has_exam,
            )
            t.priority = p_label
            t.priority_score = p_score
            t.priority_explanation = p_exp

        # Sort tasks: highest priority score first, then earliest deadline
        sorted_tasks = sorted(
            tasks,
            key=lambda x: (
                -x.priority_score,
                x.deadline or datetime.max
            )
        )

        total_budget_minutes = int(available_hours * 60)
        current_time_str = start_time
        scheduled_minutes = 0
        blocks_data = []

        # Remove existing current schedule blocks for today to regenerate cleanly
        db.query(ScheduleBlock).filter(
            ScheduleBlock.user_id == user_id,
            ScheduleBlock.plan_date == plan_date,
            ScheduleBlock.plan_version == "current"
        ).delete()

        preserved_task_names = []

        for task in sorted_tasks:
            if scheduled_minutes >= total_budget_minutes:
                break

            course_name = task.course.name if task.course else "General"
            
            # Allocate either task remaining minutes or session duration, whichever fits
            remaining_for_task = task.remaining_minutes
            time_left_in_budget = total_budget_minutes - scheduled_minutes

            allocated = min(remaining_for_task, session_mins, time_left_in_budget)
            if allocated < 15 and time_left_in_budget >= 15:
                allocated = min(time_left_in_budget, 15)
            elif allocated < 15:
                break

            end_time_str = cls._add_minutes_to_time(current_time_str, allocated)

            block = ScheduleBlock(
                user_id=user_id,
                task_id=task.id,
                title=f"{task.title}",
                subject_name=course_name,
                plan_date=plan_date,
                start_time=current_time_str,
                end_time=end_time_str,
                duration_minutes=allocated,
                priority=task.priority,
                plan_version="current",
                is_completed=False,
                is_break=False,
            )
            db.add(block)
            blocks_data.append(block)
            scheduled_minutes += allocated
            current_time_str = end_time_str
            preserved_task_names.append(task.title)

            # Insert scheduled break if configured and there's time remaining
            if include_breaks and (total_budget_minutes - scheduled_minutes) >= 25:
                break_duration = min(break_mins, total_budget_minutes - scheduled_minutes - 15)
                if break_duration >= 10:
                    break_end_time = cls._add_minutes_to_time(current_time_str, break_duration)
                    break_block = ScheduleBlock(
                        user_id=user_id,
                        task_id=None,
                        title="Rest & Recharge Break",
                        subject_name="Break",
                        plan_date=plan_date,
                        start_time=current_time_str,
                        end_time=break_end_time,
                        duration_minutes=break_duration,
                        priority="LOW",
                        plan_version="current",
                        is_completed=False,
                        is_break=True,
                    )
                    db.add(break_block)
                    blocks_data.append(break_block)
                    current_time_str = break_end_time
                    scheduled_minutes += break_duration

        db.commit()

        # Generate intelligent contextual explanation
        if preserved_task_names:
            explanation = f"Generated a {round(available_hours, 1)}-hour plan focusing first on {preserved_task_names[0]} based on highest urgency and upcoming academic deadlines."
        else:
            explanation = "No pending tasks required scheduling for today."

        return {
            "plan_date": str(plan_date),
            "available_hours": available_hours,
            "total_study_minutes": scheduled_minutes,
            "blocks": blocks_data,
            "ai_explanation": explanation,
            "preserved_tasks": preserved_task_names,
            "moved_tasks": [],
            "is_replanned": False,
        }

    @classmethod
    def adaptively_replan(
        cls,
        db: Session,
        user_id: str,
        reason: str,
        affected_task_id: Optional[str] = None,
        minutes_completed: Optional[int] = None,
        hours_lost: Optional[float] = None,
        remaining_available_hours: Optional[float] = None,
        plan_date: Optional[date] = None,
    ) -> Dict[str, Any]:
        """
        Signature Feature: Adaptive Replanning Engine as described in Section 5 & 20.
        
        1. Calculate remaining workload for the affected task.
        2. Check remaining available time.
        3. Recalculate task priorities.
        4. Check upcoming deadlines.
        5. Identify low-priority tasks that can move.
        6. Rebuild the schedule.
        7. Explain what changed and why!
        """
        if plan_date is None:
            plan_date = date.today()

        # Step 1: Update affected task if provided
        affected_task = None
        if affected_task_id:
            affected_task = db.query(Task).filter(Task.id == affected_task_id, Task.user_id == user_id).first()
            if affected_task and minutes_completed is not None:
                affected_task.actual_minutes += minutes_completed
                affected_task.remaining_minutes = max(0, affected_task.remaining_minutes - minutes_completed)
                if affected_task.estimated_minutes > 0:
                    affected_task.progress = min(
                        95,
                        int((affected_task.actual_minutes / max(affected_task.estimated_minutes, affected_task.actual_minutes + affected_task.remaining_minutes)) * 100)
                    )
                affected_task.status = "in_progress"
                db.commit()

        # Step 2: Determine available time after disruption
        existing_blocks = (
            db.query(ScheduleBlock)
            .filter(
                ScheduleBlock.user_id == user_id,
                ScheduleBlock.plan_date == plan_date,
                ScheduleBlock.plan_version == "current"
            )
            .all()
        )

        total_original_mins = sum(b.duration_minutes for b in existing_blocks if not b.is_break)
        if total_original_mins == 0:
            total_original_mins = 180  # Default 3 hours if no previous plan

        if remaining_available_hours is not None:
            new_budget_minutes = int(remaining_available_hours * 60)
        elif hours_lost is not None:
            lost_mins = int(hours_lost * 60)
            new_budget_minutes = max(30, total_original_mins - lost_mins)
        elif minutes_completed is not None and affected_task:
            # Task took time without completion; deduct spent time
            new_budget_minutes = max(45, total_original_mins - minutes_completed)
        else:
            new_budget_minutes = max(60, int(total_original_mins * 0.65))

        # Archive current blocks to "original" version for history tracking
        for b in existing_blocks:
            b.plan_version = "original"
        db.commit()

        # Step 3: Fetch active tasks and recalculate priorities
        active_tasks = (
            db.query(Task)
            .filter(
                Task.user_id == user_id,
                Task.status.in_(["pending", "in_progress"]),
                Task.remaining_minutes > 0
            )
            .all()
        )

        for t in active_tasks:
            has_exam = any("EXAM" in (other.task_type or "").upper() and other.course_id == t.course_id for other in active_tasks)
            blocks_count = len(t.blocked_by)
            p_label, p_score, p_exp = PriorityEngine.calculate_task_priority(
                title=t.title,
                task_type=t.task_type,
                deadline=t.deadline,
                remaining_minutes=t.remaining_minutes,
                progress=t.progress,
                blocks_count=blocks_count,
                has_upcoming_exam=has_exam,
            )
            t.priority = p_label
            t.priority_score = p_score
            t.priority_explanation = p_exp

        # Step 4: Re-prioritize: prioritize tasks with close deadlines and high scores
        sorted_tasks = sorted(
            active_tasks,
            key=lambda x: (
                -x.priority_score,
                x.deadline or datetime.max
            )
        )

        # Step 5: Build revised schedule
        current_time_str = datetime.now().strftime("%H:%M")
        # Round up to nearest 15 minutes
        h, m = cls._parse_time(current_time_str)
        m = ((m // 15) + 1) * 15
        if m >= 60:
            h = (h + 1) % 24
            m = 0
        current_time_str = cls._format_time(h, m)

        scheduled_minutes = 0
        new_blocks = []
        preserved_tasks = []
        moved_tasks = []

        # Find which tasks were in the old plan
        old_task_ids = {b.task_id for b in existing_blocks if b.task_id}

        for task in sorted_tasks:
            course_name = task.course.name if task.course else "General"
            time_left = new_budget_minutes - scheduled_minutes

            if time_left < 20:
                if task.id in old_task_ids:
                    moved_tasks.append(task.title)
                continue

            session_duration = min(task.remaining_minutes, 45, time_left)
            end_time_str = cls._add_minutes_to_time(current_time_str, session_duration)

            new_block = ScheduleBlock(
                user_id=user_id,
                task_id=task.id,
                title=f"{task.title}",
                subject_name=course_name,
                plan_date=plan_date,
                start_time=current_time_str,
                end_time=end_time_str,
                duration_minutes=session_duration,
                priority=task.priority,
                plan_version="current",
                revised_reason=f"Replanned due to: {reason}",
                is_completed=False,
                is_break=False,
            )
            db.add(new_block)
            new_blocks.append(new_block)
            scheduled_minutes += session_duration
            current_time_str = end_time_str
            preserved_tasks.append(task.title)

        db.commit()

        # Step 7: Formulate intelligent, human-friendly explanation of changes
        if moved_tasks and preserved_tasks:
            explanation = (
                f"Schedule adapted: {reason}. Preserved urgent priority on '{preserved_tasks[0]}' "
                f"while moving lower-urgency tasks ({', '.join(moved_tasks[:2])}) to preserve academic deadlines."
            )
        elif preserved_tasks:
            explanation = (
                f"Schedule successfully re-balanced: {reason}. Compacted today's study blocks to "
                f"{round(new_budget_minutes / 60.0, 1)} hours focused on {', '.join(preserved_tasks)}."
            )
        else:
            explanation = f"Schedule adapted for {reason}. No high-urgency tasks remaining for today."

        return {
            "plan_date": str(plan_date),
            "available_hours": round(new_budget_minutes / 60.0, 2),
            "total_study_minutes": scheduled_minutes,
            "blocks": new_blocks,
            "ai_explanation": explanation,
            "preserved_tasks": preserved_tasks,
            "moved_tasks": moved_tasks,
            "is_replanned": True,
        }
