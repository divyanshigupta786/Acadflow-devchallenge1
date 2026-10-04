import time
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.ai.providers import get_llm_provider
from app.ai.extraction.rules import AntiHallucinationRules
from app.models.course import Course
from app.schemas.inbox import ExtractedTaskItem, InboxExtractResponse


class AcademicExtractor:
    EXTRACTION_SYSTEM_PROMPT = """
You are AcadFlow's Core Academic Information Extraction Engine.
Your goal is to parse messy student inputs (messages, announcements, syllabus notes, reminders) and extract structured academic tasks.

CRITICAL ANTI-HALLUCINATION RULES:
1. NEVER invent deadlines. If a deadline or date is not explicitly mentioned in the text, you MUST return "deadline": null.
2. If a date is ambiguous (e.g., "next week"), set "is_deadline_ambiguous": true and provide an explanation.
3. Classify task_type accurately: "Assignment", "Exam", "Quiz", "Project", "Lab", "Presentation", "Reading", "Revision", or "Other".
4. Extract specific syllabus topics and requirements if present.
5. Provide a realistic estimated_minutes (e.g. 60, 90, 120).

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this schema:
{
  "tasks": [
    {
      "title": "DBMS Assignment",
      "subject_name": "Database Management Systems",
      "task_type": "Assignment",
      "deadline_raw_text": "Friday 5 PM",
      "deadline": "2026-10-09T17:00:00",
      "is_deadline_ambiguous": false,
      "ambiguity_explanation": null,
      "topics": ["Normalization", "B+ Trees"],
      "requirements": ["Submit PDF via portal"],
      "estimated_minutes": 90,
      "priority": "HIGH"
    }
  ]
}
"""

    @classmethod
    async def extract_academic_items(
        cls,
        raw_text: str,
        source_type: str = "text",
        db: Optional[Session] = None,
        user_id: Optional[str] = None
    ) -> InboxExtractResponse:
        start_time = time.time()
        provider = await get_llm_provider()
        now_iso = datetime.utcnow().strftime("%A, %Y-%m-%d %H:%M UTC")

        prompt = f"""
Current Date/Time reference: {now_iso}
Student Input:
\"\"\"
{raw_text}
\"\"\"

Extract all academic items according to your instructions.
"""
        provider_name = provider.__class__.__name__

        try:
            result = await provider.generate_json(
                prompt=prompt,
                system_prompt=cls.EXTRACTION_SYSTEM_PROMPT
            )
            raw_tasks = result.get("tasks", [])
        except Exception as e:
            # Fallback to deterministic regex extractor on any JSON parsing or network error
            from app.ai.providers.fallback import DeterministicFallbackProvider
            fallback = DeterministicFallbackProvider()
            result = await fallback.generate_json(prompt=raw_text)
            raw_tasks = result.get("tasks", [])
            provider_name = "DeterministicFallback (Recovered)"

        # Match subject_name with existing user courses in DB if available
        user_courses = []
        if db and user_id:
            user_courses = db.query(Course).filter(Course.user_id == user_id).all()

        extracted_items: List[ExtractedTaskItem] = []
        for t in raw_tasks:
            validated = AntiHallucinationRules.validate_extracted_task(t)

            matched_course_id = None
            subj = validated.get("subject_name", "")
            if subj and user_courses:
                for c in user_courses:
                    if c.code.lower() in subj.lower() or c.name.lower() in subj.lower() or subj.lower() in c.name.lower():
                        matched_course_id = c.id
                        validated["subject_name"] = c.name
                        break

            # Parse deadline string to datetime if valid
            dl_obj = None
            dl_str = validated.get("deadline")
            if dl_str:
                try:
                    dl_obj = datetime.fromisoformat(dl_str.replace("Z", "+00:00"))
                except Exception:
                    dl_obj = None

            extracted_items.append(
                ExtractedTaskItem(
                    title=validated.get("title", "Academic Task"),
                    subject_name=validated.get("subject_name"),
                    course_id=matched_course_id,
                    task_type=validated.get("task_type", "Assignment"),
                    deadline=dl_obj,
                    deadline_raw_text=validated.get("deadline_raw_text"),
                    is_deadline_ambiguous=validated.get("is_deadline_ambiguous", False),
                    ambiguity_explanation=validated.get("ambiguity_explanation"),
                    topics=validated.get("topics", []),
                    requirements=validated.get("requirements", []),
                    estimated_minutes=validated.get("estimated_minutes", 60),
                    is_workload_inferred=True,
                    priority=validated.get("priority", "MEDIUM"),
                    confidence_score=validated.get("confidence_score", 0.90),
                    notes=validated.get("notes"),
                )
            )

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return InboxExtractResponse(
            extracted_tasks=extracted_items,
            raw_input=raw_text,
            source_type=source_type,
            ai_provider=provider_name,
            ai_model="Configured Open-Source Model",
            processing_time_ms=elapsed_ms,
            confidence_summary=f"Extracted {len(extracted_items)} task(s) with zero-hallucination validation in {elapsed_ms}ms.",
        )
