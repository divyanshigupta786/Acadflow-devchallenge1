import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.ai.agents.tools import AgentTools
from app.ai.providers import get_llm_provider


class AgentOrchestrator:
    @classmethod
    async def process_user_intent(
        cls,
        db: Session,
        user_id: str,
        user_message: str
    ) -> Dict[str, Any]:
        msg_lower = user_message.lower()
        tools_executed = []
        action_taken = None
        data_payload = {}

        # 1. Intent Detection: "I have X hours free / What should I study / plan today"
        hour_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:hour|hr|hours)', msg_lower)
        if any(k in msg_lower for k in ["what should i do", "what should i study", "plan", "free", "hours free"]):
            tools_executed.append("get_tasks()")
            tools_executed.append("get_deadlines()")
            tools_executed.append("get_student_preferences()")
            tools_executed.append("calculate_priority()")
            
            hours = float(hour_match.group(1)) if hour_match else 3.0
            tools_executed.append(f"create_schedule(hours={hours})")
            
            plan_res = AgentTools.create_daily_plan(db, user_id, hours=hours)
            action_taken = "schedule_generated"
            data_payload = {
                "available_hours": hours,
                "plan": plan_res["ai_explanation"],
                "blocks_count": len(plan_res["blocks"])
            }
            response_text = (
                f"I've analyzed your upcoming deadlines and priorities. "
                f"For your {hours}-hour study window, here is your plan:\n\n"
                f"{plan_res['ai_explanation']}\n\n"
                f"You can view and manage these study blocks directly in your Planner."
            )

        # 2. Intent Detection: "I lost time / couldn't finish / replan"
        elif any(k in msg_lower for k in ["replan", "couldn't complete", "lost", "behind", "ran out of time"]):
            tools_executed.append("get_tasks()")
            tools_executed.append("replan_schedule()")
            
            lost_hours = float(hour_match.group(1)) if hour_match else 1.5
            replan_res = AgentTools.adaptively_replan(db, user_id, reason=user_message, hours_lost=lost_hours)
            action_taken = "schedule_replanned"
            data_payload = replan_res
            response_text = replan_res["ai_explanation"]

        # 3. Intent Detection: "What's on the syllabus / notes / quiz question"
        elif any(k in msg_lower for k in ["syllabus", "notes", "quiz", "what do i need to study", "question"]):
            tools_executed.append(f"search_knowledge(query='{user_message[:50]}')")
            rag_res = await AgentTools.search_knowledge(db, user_id, query=user_message)
            action_taken = "knowledge_retrieved"
            data_payload = rag_res
            response_text = rag_res["answer"]

        # 4. General academic query
        else:
            tools_executed.append("get_tasks()")
            tasks = AgentTools.get_tasks(db, user_id, status="pending")
            provider = await get_llm_provider()
            
            task_summary = ", ".join([f"{t['title']} (Priority: {t['priority']})" for t in tasks[:5]])
            prompt = f"""
Student asks: "{user_message}"
Current pending tasks: {task_summary or 'No urgent tasks'}
Provide a concise, helpful academic coaching response:
"""
            try:
                response_text = await provider.generate_text(prompt)
            except Exception:
                response_text = f"You have {len(tasks)} pending academic tasks. Would you like me to generate a focused schedule for today?"

        return {
            "response": response_text,
            "tools_executed": tools_executed,
            "action_taken": action_taken,
            "data": data_payload
        }
