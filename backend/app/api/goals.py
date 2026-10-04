from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse, GoalGenerateMilestonesRequest
from app.api.deps import get_current_user

router = APIRouter(prefix="/goals", tags=["Goals & Roadmaps"])


@router.get("", response_model=List[GoalResponse])
def get_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Goal).filter(Goal.user_id == current_user.id).order_by(Goal.created_at.desc()).all()


@router.post("", response_model=GoalResponse)
def create_goal(
    goal_in: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    milestones = goal_in.milestones
    if not milestones:
        # Generate smart milestone roadmap for this goal title
        milestones = [
            {"id": 1, "title": f"Complete foundational study for {goal_in.title}", "completed": False},
            {"id": 2, "title": "Work through 15 high-frequency problem sets", "completed": False},
            {"id": 3, "title": "Synthesize comprehensive summary cheat-sheet", "completed": False},
            {"id": 4, "title": "Complete full timed mock evaluation", "completed": False}
        ]

    goal = Goal(
        user_id=current_user.id,
        title=goal_in.title,
        description=goal_in.description,
        category=goal_in.category,
        target_date=goal_in.target_date,
        progress=goal_in.progress,
        milestones=milestones,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: str,
    goal_in: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")

    for k, v in goal_in.dict(exclude_unset=True).items():
        setattr(goal, k, v)

    # Automatically compute progress percentage from completed milestones
    if goal.milestones:
        completed = sum(1 for m in goal.milestones if m.get("completed"))
        goal.progress = int((completed / len(goal.milestones)) * 100)

    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}")
def delete_goal(goal_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted."}
