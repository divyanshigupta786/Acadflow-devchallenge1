import pytest
from datetime import datetime, timedelta, date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.user import User, StudentPreference
from app.models.task import Task
from app.models.course import Course
from app.models.schedule import ScheduleBlock
from app.services.schedule_service import ScheduleService
from app.services.auth_service import AuthService


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_signature_adaptive_replanning(test_db):
    # 1. Setup student
    user = User(
        email="student@univ.edu",
        hashed_password=AuthService.get_password_hash("pass123"),
        full_name="Test Student"
    )
    test_db.add(user)
    test_db.commit()

    now = datetime.utcnow()
    today = date.today()

    # 2. Setup tasks: High priority CN Quiz vs Lower priority Documentation
    quiz_task = Task(
        user_id=user.id,
        title="CN Quiz Preparation",
        task_type="Quiz",
        deadline=now + timedelta(hours=18),
        estimated_minutes=90,
        remaining_minutes=90,
        progress=0,
        priority="CRITICAL",
        priority_score=85.0
    )
    doc_task = Task(
        user_id=user.id,
        title="Project Documentation",
        task_type="Assignment",
        deadline=now + timedelta(days=6),
        estimated_minutes=60,
        remaining_minutes=60,
        progress=0,
        priority="LOW",
        priority_score=20.0
    )
    dbms_task = Task(
        user_id=user.id,
        title="DBMS Assignment",
        task_type="Assignment",
        deadline=now + timedelta(hours=28),
        estimated_minutes=120,
        remaining_minutes=120,
        progress=0,
        priority="HIGH",
        priority_score=65.0
    )
    test_db.add_all([quiz_task, doc_task, dbms_task])
    test_db.commit()

    # 3. Generate initial schedule (3 hours budget)
    init_plan = ScheduleService.generate_daily_schedule(
        db=test_db,
        user_id=user.id,
        available_hours=3.0,
        plan_date=today
    )
    assert len(init_plan["blocks"]) >= 2

    # 4. Trigger Adaptive Replanning:
    # "I only completed 45 minutes of DBMS"
    replan_res = ScheduleService.adaptively_replan(
        db=test_db,
        user_id=user.id,
        reason="I only completed 45 minutes of DBMS.",
        affected_task_id=dbms_task.id,
        minutes_completed=45
    )

    # 5. Verify results
    assert replan_res["is_replanned"] is True
    assert replan_res["ai_explanation"] is not None
    # Verify DBMS task was updated with spent time
    test_db.refresh(dbms_task)
    assert dbms_task.actual_minutes == 45
    assert dbms_task.remaining_minutes == 75

    # Verify high stakes task (CN Quiz) was preserved
    assert any("CN Quiz" in t for t in replan_res["preserved_tasks"])
