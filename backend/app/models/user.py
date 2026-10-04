import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer, Float, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    preferences = relationship("StudentPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    schedule_blocks = relationship("ScheduleBlock", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    ai_memories = relationship("AIMemory", back_populates="user", cascade="all, delete-orphan")


class StudentPreference(Base):
    __tablename__ = "student_preferences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    preferred_study_duration = Column(Integer, default=45)  # minutes per focus block
    break_duration = Column(Integer, default=15)           # minutes between focus blocks
    preferred_study_time = Column(String(50), default="morning")  # morning, afternoon, evening, night
    available_daily_hours = Column(Float, default=4.0)
    strong_subjects = Column(JSON, default=list)            # list of course codes or topics
    weak_subjects = Column(JSON, default=list)              # list of course codes or topics
    typical_task_completion_factor = Column(Float, default=1.0) # historical multiplier
    programming_task_multiplier = Column(Float, default=1.3)     # e.g., 30% longer on coding
    reading_task_multiplier = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="preferences")


class AIMemory(Base):
    __tablename__ = "ai_memory"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    memory_type = Column(String(50), nullable=False)  # 'preference', 'pattern', 'correction', 'study_rhythm'
    key = Column(String(100), nullable=False)
    value = Column(String(500), nullable=False)
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="ai_memories")
