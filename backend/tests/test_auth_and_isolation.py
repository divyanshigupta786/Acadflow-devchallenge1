import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.user import User
from app.models.task import Task
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


def test_auth_password_hashing():
    pw = "secretpassword123"
    hashed = AuthService.get_password_hash(pw)
    assert hashed != pw
    assert AuthService.verify_password(pw, hashed) is True
    assert AuthService.verify_password("wrongpass", hashed) is False


def test_auth_jwt_token_roundtrip():
    payload = {"sub": "user-uuid-123", "email": "test@univ.edu"}
    token = AuthService.create_access_token(payload)
    decoded = AuthService.decode_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user-uuid-123"
    assert decoded["email"] == "test@univ.edu"


def test_user_data_isolation(test_db):
    # Create User A
    user_a = User(
        email="student_a@univ.edu",
        hashed_password=AuthService.get_password_hash("passA"),
        full_name="Student A"
    )
    # Create User B
    user_b = User(
        email="student_b@univ.edu",
        hashed_password=AuthService.get_password_hash("passB"),
        full_name="Student B"
    )
    test_db.add_all([user_a, user_b])
    test_db.commit()

    # User A creates a confidential task
    task_a = Task(
        user_id=user_a.id,
        title="Student A Confidential Project",
        task_type="Project",
        estimated_minutes=60,
        remaining_minutes=60
    )
    test_db.add(task_a)
    test_db.commit()

    # Query tasks for User B
    user_b_tasks = test_db.query(Task).filter(Task.user_id == user_b.id).all()
    assert len(user_b_tasks) == 0

    # User A tasks should only contain task_a
    user_a_tasks = test_db.query(Task).filter(Task.user_id == user_a.id).all()
    assert len(user_a_tasks) == 1
    assert user_a_tasks[0].title == "Student A Confidential Project"
