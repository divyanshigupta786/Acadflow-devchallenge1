from datetime import datetime, timedelta
from app.services.priority_service import PriorityEngine


def test_priority_engine_urgent_task():
    now = datetime.utcnow()
    # Task due in 12 hours, 0% complete, Exam/Quiz
    p_label, p_score, p_exp = PriorityEngine.calculate_task_priority(
        title="Computer Networks Quiz",
        task_type="Quiz",
        deadline=now + timedelta(hours=12),
        remaining_minutes=90,
        progress=0,
        now=now
    )
    assert p_label in ["CRITICAL", "HIGH"]
    assert p_score >= 50.0
    assert "due in 12 hours" in p_exp


def test_priority_engine_completed_task():
    now = datetime.utcnow()
    p_label, p_score, p_exp = PriorityEngine.calculate_task_priority(
        title="Completed Lab",
        task_type="Lab",
        deadline=now + timedelta(hours=24),
        remaining_minutes=0,
        progress=100,
        now=now
    )
    assert p_label == "LOW"
    assert p_score == 0.0
    assert "100% complete" in p_exp


def test_priority_engine_progress_lowers_priority():
    now = datetime.utcnow()
    # 10% progress vs 80% progress
    _, score_low_prog, _ = PriorityEngine.calculate_task_priority(
        title="DBMS Assignment",
        task_type="Assignment",
        deadline=now + timedelta(days=2),
        remaining_minutes=120,
        progress=10,
        now=now
    )

    _, score_high_prog, _ = PriorityEngine.calculate_task_priority(
        title="DBMS Assignment",
        task_type="Assignment",
        deadline=now + timedelta(days=2),
        remaining_minutes=30,
        progress=80,
        now=now
    )

    assert score_low_prog > score_high_prog
