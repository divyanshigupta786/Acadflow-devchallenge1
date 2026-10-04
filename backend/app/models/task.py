import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Boolean, JSON, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    task_type = Column(String(50), default="Assignment")  # Assignment, Exam, Quiz, Project, Lab, Presentation, Reading, Revision, Other
    
    # Deadlines (Nullable to guarantee zero hallucination)
    deadline = Column(DateTime, nullable=True)
    
    # Workload tracking
    estimated_minutes = Column(Integer, default=60)
    remaining_minutes = Column(Integer, default=60)
    actual_minutes = Column(Integer, default=0)
    confidence_score = Column(Float, default=0.8) # 0.0 to 1.0 confidence in estimate
    
    # Priority engine fields
    priority = Column(String(20), default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW
    priority_score = Column(Float, default=50.0)      # Computed by deterministic engine
    priority_explanation = Column(Text, nullable=True)
    
    # Progress and Status
    progress = Column(Integer, default=0)  # 0 to 100 percent
    status = Column(String(30), default="pending")  # pending, in_progress, completed, deferred
    difficulty = Column(String(20), default="medium") # easy, medium, hard
    
    # Transparency
    is_inferred = Column(Boolean, default=False)  # True if deadline/workload was AI inferred
    topics = Column(JSON, default=list)            # Specific syllabus topics or chapters
    requirements = Column(JSON, default=list)      # Specific assignment instructions/bullets
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="tasks")
    course = relationship("Course", back_populates="tasks")
    schedule_blocks = relationship("ScheduleBlock", back_populates="task", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="task", cascade="all, delete-orphan")
    
    dependencies = relationship(
        "TaskDependency",
        foreign_keys="TaskDependency.task_id",
        back_populates="task",
        cascade="all, delete-orphan"
    )
    blocked_by = relationship(
        "TaskDependency",
        foreign_keys="TaskDependency.depends_on_task_id",
        back_populates="depends_on_task",
        cascade="all, delete-orphan"
    )


class TaskDependency(Base):
    __tablename__ = "task_dependencies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String(36), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    depends_on_task_id = Column(String(36), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    is_blocker = Column(Boolean, default=True)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task", foreign_keys=[task_id], back_populates="dependencies")
    depends_on_task = relationship("Task", foreign_keys=[depends_on_task_id], back_populates="blocked_by")
