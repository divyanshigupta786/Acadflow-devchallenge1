from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, StudentPreference
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.services.auth_service import AuthService
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")

    new_user = User(
        email=user_in.email,
        hashed_password=AuthService.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize default student preferences
    pref = StudentPreference(
        user_id=new_user.id,
        available_daily_hours=4.0,
        preferred_study_duration=45,
        break_duration=15,
        strong_subjects=[],
        weak_subjects=[],
    )
    db.add(pref)
    db.commit()

    token = AuthService.create_access_token({"sub": new_user.id, "email": new_user.email})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=new_user.id,
        full_name=new_user.full_name,
        email=new_user.email,
    )


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not AuthService.verify_password(login_in.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    token = AuthService.create_access_token({"sub": user.id, "email": user.email})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
    )


@router.post("/demo-login", response_model=Token)
def demo_login(db: Session = Depends(get_db)):
    """Instant 1-click login as seeded demo student Alex Chen."""
    demo_user = db.query(User).filter(User.email == "demo@acadflow.dev").first()
    if not demo_user:
        from app.seed_data import seed_demo_data
        demo_user = seed_demo_data(db)

    token = AuthService.create_access_token({"sub": demo_user.id, "email": demo_user.email})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=demo_user.id,
        full_name=demo_user.full_name,
        email=demo_user.email,
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
