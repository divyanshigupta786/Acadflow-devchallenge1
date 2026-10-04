from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.project import Project, ProjectMember, ProjectTask
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectTaskCreate,
    ProjectTaskUpdate,
    ProjectTaskResponse,
    ProjectMemberCreate,
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/projects", tags=["Project Mode"])


def _format_project_response(p: Project) -> ProjectResponse:
    resp = ProjectResponse.from_orm(p)
    resp.active_blockers_count = sum(1 for t in p.project_tasks if t.is_blocked)
    return resp


@router.get("", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    projects = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).all()
    return [_format_project_response(p) for p in projects]


@router.post("", response_model=ProjectResponse)
def create_project(
    proj_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = Project(
        user_id=current_user.id,
        title=proj_in.title,
        description=proj_in.description,
        deadline=proj_in.deadline,
        status=proj_in.status,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    for m in proj_in.members:
        member = ProjectMember(project_id=project.id, name=m.name, role=m.role, email=m.email)
        db.add(member)

    for t in proj_in.tasks:
        ptask = ProjectTask(
            project_id=project.id,
            title=t.title,
            assignee_name=t.assignee_name,
            status=t.status,
            deadline=t.deadline,
            is_blocked=t.is_blocked,
            blocker_reason=t.blocker_reason,
            blocked_by_task_title=t.blocked_by_task_title,
        )
        db.add(ptask)

    db.commit()
    db.refresh(project)
    return _format_project_response(project)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    proj = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")
    return _format_project_response(proj)


@router.post("/{project_id}/tasks", response_model=ProjectTaskResponse)
def add_project_task(
    project_id: str,
    task_in: ProjectTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proj = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")

    ptask = ProjectTask(
        project_id=project_id,
        title=task_in.title,
        assignee_name=task_in.assignee_name,
        status=task_in.status,
        deadline=task_in.deadline,
        is_blocked=task_in.is_blocked,
        blocker_reason=task_in.blocker_reason,
        blocked_by_task_title=task_in.blocked_by_task_title,
    )
    db.add(ptask)
    db.commit()
    db.refresh(ptask)
    return ptask


@router.put("/{project_id}/tasks/{task_id}", response_model=ProjectTaskResponse)
def update_project_task(
    project_id: str,
    task_id: str,
    task_in: ProjectTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ptask = db.query(ProjectTask).filter(ProjectTask.id == task_id, ProjectTask.project_id == project_id).first()
    if not ptask:
        raise HTTPException(status_code=404, detail="Project task not found.")

    for k, v in task_in.dict(exclude_unset=True).items():
        setattr(ptask, k, v)

    db.commit()
    db.refresh(ptask)
    return ptask
