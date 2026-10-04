from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.user import User, StudentPreference
from app.schemas.preferences import StudentPreferenceUpdate, StudentPreferenceResponse, LLMConfigSettings
from app.config import settings
from app.ai.providers import get_llm_provider
from app.api.deps import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings & Preferences"])


@router.get("/preferences", response_model=StudentPreferenceResponse)
def get_preferences(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pref = db.query(StudentPreference).filter(StudentPreference.user_id == current_user.id).first()
    if not pref:
        pref = StudentPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref


@router.put("/preferences", response_model=StudentPreferenceResponse)
def update_preferences(
    pref_in: StudentPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pref = db.query(StudentPreference).filter(StudentPreference.user_id == current_user.id).first()
    if not pref:
        pref = StudentPreference(user_id=current_user.id)
        db.add(pref)

    for k, v in pref_in.dict(exclude_unset=True).items():
        setattr(pref, k, v)

    db.commit()
    db.refresh(pref)
    return pref


@router.get("/llm", response_model=LLMConfigSettings)
async def get_llm_config():
    provider = await get_llm_provider()
    is_live = await provider.is_available()
    status_str = "connected (Ollama live)" if is_live and provider.__class__.__name__ == "OllamaProvider" else "fallback (Deterministic Engine ready)"

    return LLMConfigSettings(
        provider=settings.LLM_PROVIDER,
        model=settings.LLM_MODEL,
        ollama_base_url=settings.OLLAMA_BASE_URL,
        status=status_str,
        active_model_details=f"Provider: {provider.__class__.__name__}, Model: {settings.LLM_MODEL}"
    )


class LLMConfigUpdate(BaseModel):
    provider: Optional[str] = None
    model: Optional[str] = None
    ollama_base_url: Optional[str] = None


@router.put("/llm", response_model=LLMConfigSettings)
async def update_llm_config(payload: LLMConfigUpdate):
    if payload.provider:
        settings.LLM_PROVIDER = payload.provider
    if payload.model:
        settings.LLM_MODEL = payload.model
    if payload.ollama_base_url:
        settings.OLLAMA_BASE_URL = payload.ollama_base_url

    provider = await get_llm_provider()
    is_live = await provider.is_available()
    status_str = "connected (Ollama live)" if is_live and provider.__class__.__name__ == "OllamaProvider" else "fallback (Deterministic Engine ready)"

    return LLMConfigSettings(
        provider=settings.LLM_PROVIDER,
        model=settings.LLM_MODEL,
        ollama_base_url=settings.OLLAMA_BASE_URL,
        status=status_str,
        active_model_details=f"Provider: {provider.__class__.__name__}, Model: {settings.LLM_MODEL}"
    )
