import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, Date, ForeignKey, Integer, Boolean, Text
from sqlalchemy.orm import relationship
from app.database import Base


class ScheduleBlock(Base):
    __tablename__ = "schedule_blocks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    task_id = Column(String(36), ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)

    title = Column(String(255), nullable=False)
    subject_name = Column(String(100), nullable=True)
    plan_date = Column(Date, default=date.today, nullable=False)
    start_time = Column(String(10), nullable=False)  # e.g., "10:00"
    end_time = Column(String(10), nullable=False)    # e.g., "11:30"
    duration_minutes = Column(Integer, default=60)
    priority = Column(String(20), default="MEDIUM")

    # Version tracking for adaptive replanning
    plan_version = Column(String(20), default="current") # "original", "revised", "current"
    is_completed = Column(Boolean, default=False)
    is_break = Column(Boolean, default=False)
    
    # Adaptive replanning audit trail
    original_start_time = Column(String(10), nullable=True)
    revised_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="schedule_blocks")
    task = relationship("Task", back_populates="schedule_blocks")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    task_id = Column(String(36), ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)

    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, default=0)
    focus_rating = Column(Integer, default=5) # 1-5
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task", back_populates="study_sessions")
