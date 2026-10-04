import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, JSON, Float
from sqlalchemy.orm import relationship
from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    code = Column(String(50), nullable=False)  # e.g., CS301, MATH202
    instructor = Column(String(100), nullable=True)
    color = Column(String(20), default="#3b82f6")  # HEX color code
    semester = Column(String(50), default="Current")
    credits = Column(Integer, default=3)
    progress = Column(Float, default=0.0)  # Percentage 0 to 100
    syllabus_topics = Column(JSON, default=list)  # e.g., ["OSI Model", "TCP/IP", "Subnetting"]
    strong_areas = Column(JSON, default=list)
    weak_areas = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="courses")
    tasks = relationship("Task", back_populates="course", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="course", cascade="all, delete-orphan")
