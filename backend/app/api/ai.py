from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.models.user import User
from app.ai.agents.orchestrator import AgentOrchestrator
from app.api.deps import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Assistant & Agent Tools"])


class AIAssistantRequest(BaseModel):
    message: str


class AIAssistantResponse(BaseModel):
    response: str
    tools_executed: List[str]
    action_taken: Optional[str] = None
    data: Dict[str, Any] = {}


@router.post("/assistant", response_model=AIAssistantResponse)
async def chat_with_academic_agent(
    payload: AIAssistantRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    res = await AgentOrchestrator.process_user_intent(
        db=db,
        user_id=current_user.id,
        user_message=payload.message
    )

    return AIAssistantResponse(
        response=res["response"],
        tools_executed=res["tools_executed"],
        action_taken=res.get("action_taken"),
        data=res.get("data", {})
    )
