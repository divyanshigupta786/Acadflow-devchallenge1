from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.task import Task
from app.models.course import Course
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskProgressUpdate
from app.services.priority_service import PriorityEngine
from app.services.workload_service import WorkloadService
from app.api.deps import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def _format_task_response(t: Task) -> TaskResponse:
    resp = TaskResponse.from_orm(t)
    if t.course:
        resp.course_name = t.course.name
        resp.course_color = t.course.color
    return resp


@router.get("", response_model=List[TaskResponse])
def get_tasks(
    status: Optional[str] = None,
    course_id: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Task).filter(Task.user_id == current_user.id)
    if status:
        q = q.filter(Task.status == status)
    if course_id:
        q = q.filter(Task.course_id == course_id)
    if priority:
        q = q.filter(Task.priority == priority.upper())

    # Order by priority score descending, then deadline
    tasks = q.order_by(Task.priority_score.desc(), Task.deadline.asc()).all()
    return [_format_task_response(t) for t in tasks]


@router.post("", response_model=TaskResponse)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rem_mins = task_in.remaining_minutes if task_in.remaining_minutes is not None else task_in.estimated_minutes

    p_label, p_score, p_exp = PriorityEngine.calculate_task_priority(
        title=task_in.title,
        task_type=task_in.task_type,
        deadline=task_in.deadline,
        remaining_minutes=rem_mins,
        progress=task_in.progress
    )

    task = Task(
        user_id=current_user.id,
        course_id=task_in.course_id,
        title=task_in.title,
        description=task_in.description,
        task_type=task_in.task_type,
        deadline=task_in.deadline,
        estimated_minutes=task_in.estimated_minutes,
        remaining_minutes=rem_mins,
        actual_minutes=task_in.actual_minutes,
        confidence_score=task_in.confidence_score,
        priority=p_label,
        priority_score=p_score,
        priority_explanation=p_exp,
        progress=task_in.progress,
        status=task_in.status,
        difficulty=task_in.difficulty,
        is_inferred=task_in.is_inferred,
        topics=task_in.topics,
        requirements=task_in.requirements,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return _format_task_response(task)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    return _format_task_response(task)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    update_data = task_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(task, field, val)

    # Recalculate priority automatically
    p_label, p_score, p_exp = PriorityEngine.calculate_task_priority(
        title=task.title,
        task_type=task.task_type,
        deadline=task.deadline,
        remaining_minutes=task.remaining_minutes,
        progress=task.progress
    )
    task.priority = p_label
    task.priority_score = p_score
    task.priority_explanation = p_exp

    db.commit()
    db.refresh(task)
    return _format_task_response(task)


@router.post("/{task_id}/progress", response_model=TaskResponse)
def update_task_progress(
    task_id: str,
    prog_in: TaskProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    if prog_in.minutes_spent is not None:
        task.actual_minutes += prog_in.minutes_spent
        task.remaining_minutes = max(0, task.remaining_minutes - prog_in.minutes_spent)

    if prog_in.progress is not None:
        task.progress = max(0, min(100, prog_in.progress))
        if task.progress >= 100:
            task.status = "completed"
            task.remaining_minutes = 0
            WorkloadService.record_task_completion(db, task, current_user.id)
        elif task.status == "pending" and task.progress > 0:
            task.status = "in_progress"

    if prog_in.status:
        task.status = prog_in.status
        if task.status == "completed":
            task.progress = 100
            task.remaining_minutes = 0
            WorkloadService.record_task_completion(db, task, current_user.id)

    # Recalculate priority
    p_label, p_score, p_exp = PriorityEngine.calculate_task_priority(
        title=task.title,
        task_type=task.task_type,
        deadline=task.deadline,
        remaining_minutes=task.remaining_minutes,
        progress=task.progress
    )
    task.priority = p_label
    task.priority_score = p_score
    task.priority_explanation = p_exp

    db.commit()
    db.refresh(task)
    return _format_task_response(task)


@router.delete("/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully."}
