from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.schedule import ScheduleBlock
from app.schemas.schedule import PlanGenerateRequest, ReplanRequest, ScheduleResponse, ScheduleBlockResponse
from app.services.schedule_service import ScheduleService
from app.api.deps import get_current_user

router = APIRouter(prefix="/schedule", tags=["Planner & Schedule"])


@router.get("/today", response_model=ScheduleResponse)
def get_today_schedule(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    blocks = (
        db.query(ScheduleBlock)
        .filter(
            ScheduleBlock.user_id == current_user.id,
            ScheduleBlock.plan_date == today,
            ScheduleBlock.plan_version == "current"
        )
        .order_by(ScheduleBlock.start_time.asc())
        .all()
    )

    if not blocks:
        # Generate initial plan automatically
        return ScheduleService.generate_daily_schedule(db=db, user_id=current_user.id, available_hours=3.5)

    study_mins = sum(b.duration_minutes for b in blocks if not b.is_break)

    return ScheduleResponse(
        plan_date=str(today),
        available_hours=round(study_mins / 60.0, 1),
        total_study_minutes=study_mins,
        blocks=blocks,
        ai_explanation=f"Active daily plan with {len(blocks)} focus and break blocks scheduled.",
        preserved_tasks=[b.title for b in blocks if not b.is_break],
        moved_tasks=[],
        is_replanned=any(b.revised_reason is not None for b in blocks),
    )


@router.post("/generate", response_model=ScheduleResponse)
def generate_schedule(
    payload: PlanGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a realistic daily plan based on student's available hours and academic priorities.
    """
    return ScheduleService.generate_daily_schedule(
        db=db,
        user_id=current_user.id,
        available_hours=payload.available_hours,
        plan_date=payload.plan_date or date.today(),
        start_time=payload.start_time,
        include_breaks=payload.include_breaks,
        preferred_session_minutes=payload.preferred_session_minutes,
    )


@router.post("/replan", response_model=ScheduleResponse)
def adaptively_replan(
    payload: ReplanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Signature Adaptive Replanning Engine (Section 5 & 20):
    Dynamically recalculates priorities, shifts low-priority tasks, and preserves high-stakes deadlines.
    """
    return ScheduleService.adaptively_replan(
        db=db,
        user_id=current_user.id,
        reason=payload.reason,
        affected_task_id=payload.affected_task_id,
        minutes_completed=payload.minutes_completed,
        hours_lost=payload.hours_lost,
        remaining_available_hours=payload.remaining_available_hours,
    )


@router.post("/blocks/{block_id}/toggle", response_model=ScheduleBlockResponse)
def toggle_block_completion(
    block_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    block = db.query(ScheduleBlock).filter(ScheduleBlock.id == block_id, ScheduleBlock.user_id == current_user.id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Schedule block not found.")

    block.is_completed = not block.is_completed
    db.commit()
    db.refresh(block)
    return block
