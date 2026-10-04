from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.course import Course
from app.models.task import Task
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse
from app.schemas.task import TaskResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("", response_model=List[CourseResponse])
def get_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Course).filter(Course.user_id == current_user.id).order_by(Course.code.asc()).all()


@router.post("", response_model=CourseResponse)
def create_course(course_in: CourseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = Course(
        user_id=current_user.id,
        name=course_in.name,
        code=course_in.code,
        instructor=course_in.instructor,
        color=course_in.color,
        semester=course_in.semester,
        credits=course_in.credits,
        syllabus_topics=course_in.syllabus_topics,
        strong_areas=course_in.strong_areas,
        weak_areas=course_in.weak_areas,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    return course


@router.get("/{course_id}/tasks", response_model=List[TaskResponse])
def get_course_tasks(course_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = db.query(Task).filter(Task.course_id == course_id, Task.user_id == current_user.id).all()
    res = []
    for t in tasks:
        resp = TaskResponse.from_orm(t)
        if t.course:
            resp.course_name = t.course.name
            resp.course_color = t.course.color
        res.append(resp)
    return res


@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: str,
    course_in: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")

    for k, v in course_in.dict(exclude_unset=True).items():
        setattr(course, k, v)

    db.commit()
    db.refresh(course)
    return course


@router.delete("/{course_id}")
def delete_course(course_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    db.delete(course)
    db.commit()
    return {"message": "Course deleted."}
