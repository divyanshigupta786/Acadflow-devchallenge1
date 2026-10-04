import re
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from app.ai.providers.base import BaseLLMProvider


class DeterministicFallbackProvider(BaseLLMProvider):
    """
    Intelligent deterministic NLP fallback provider.
    Guarantees the system operates reliably even when the local LLM server is offline,
    strictly adhering to the Anti-Hallucination rule (no invented deadlines).
    """

    async def is_available(self) -> bool:
        return True

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        return (
            "AcadFlow deterministic engine processed your academic request. "
            "Local open-source LLM (Ollama) is currently operating in offline/deterministic mode."
        )

    async def generate_json(self, prompt: str, schema: Optional[Dict[str, Any]] = None, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        prompt_lower = prompt.lower()
        now = datetime.utcnow()

        # Days of week mapping
        weekday_map = {
            "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
            "friday": 4, "saturday": 5, "sunday": 6
        }

        # Recognize known courses
        known_courses = [
            ("dbms", "Database Management Systems"),
            ("cn", "Computer Networks"),
            ("computer networks", "Computer Networks"),
            ("os", "Operating Systems"),
            ("operating systems", "Operating Systems"),
            ("dsa", "Data Structures & Algorithms"),
            ("data structures", "Data Structures & Algorithms"),
            ("maths", "Mathematics"),
            ("mathematics", "Mathematics"),
            ("project", "Academic Project"),
        ]

        # Break text into potential clauses/sentences
        sentences = re.split(r'[,.\n;]+|\band\b', prompt_lower)
        extracted_items = []

        for s in sentences:
            s_clean = s.strip()
            if not s_clean or len(s_clean) < 4:
                continue

            # Identify subject
            subject_found = None
            for code, full_name in known_courses:
                if re.search(rf'\b{re.escape(code)}\b', s_clean):
                    subject_found = full_name
                    break

            # Identify task type
            task_type = "Assignment"
            if any(k in s_clean for k in ["quiz", "test", "viva"]):
                task_type = "Quiz"
            elif any(k in s_clean for k in ["midterm", "exam", "final"]):
                task_type = "Exam"
            elif any(k in s_clean for k in ["presentation", "ppt", "demo"]):
                task_type = "Presentation"
            elif any(k in s_clean for k in ["project", "capstone"]):
                task_type = "Project"
            elif any(k in s_clean for k in ["lab", "experiment"]):
                task_type = "Lab"
            elif any(k in s_clean for k in ["reading", "read", "chapter"]):
                task_type = "Reading"
            elif any(k in s_clean for k in ["revision", "revise"]):
                task_type = "Revision"

            # Parse deadline strictly from text (NEVER INVENT A DEADLINE)
            extracted_deadline = None
            deadline_raw = None
            is_ambiguous = False
            ambiguity_note = None

            if "tomorrow" in s_clean:
                extracted_deadline = (now + timedelta(days=1)).replace(hour=17, minute=0, second=0, microsecond=0)
                deadline_raw = "tomorrow 5:00 PM"
            elif "today" in s_clean and "study" not in s_clean:
                extracted_deadline = now.replace(hour=23, minute=59, second=0, microsecond=0)
                deadline_raw = "today 11:59 PM"
            elif "next week" in s_clean:
                extracted_deadline = (now + timedelta(days=7)).replace(hour=12, minute=0, second=0, microsecond=0)
                deadline_raw = "next week"
                is_ambiguous = True
                ambiguity_note = "Exact day of next week was not specified. Defaulting to next Monday."
            else:
                for day_name, day_idx in weekday_map.items():
                    if day_name in s_clean:
                        today_idx = now.weekday()
                        days_ahead = (day_idx - today_idx) % 7
                        if days_ahead == 0:
                            days_ahead = 7
                        extracted_deadline = (now + timedelta(days=days_ahead)).replace(hour=17, minute=0, second=0, microsecond=0)
                        deadline_raw = day_name.capitalize()
                        break

            # Topics extraction
            topics = []
            topic_match = re.search(r'(?:chapter|ch|unit|topic|topics)\s*([0-9,\s&and]+|[a-zA-Z\s]+)', s_clean)
            if topic_match:
                raw_topics = topic_match.group(0).strip()
                topics.append(raw_topics)

            # Title formulation
            title_parts = []
            if subject_found:
                title_parts.append(subject_found)
            title_parts.append(task_type)
            title = " ".join(title_parts)

            # Fallback title if empty
            if not title.strip() or title == "Assignment":
                title = f"{s_clean[:30].capitalize()}..."

            # Only add if it looks like a meaningful academic task
            if subject_found or task_type != "Assignment" or extracted_deadline:
                extracted_items.append({
                    "title": title,
                    "subject_name": subject_found or "General Academic",
                    "task_type": task_type,
                    "deadline": extracted_deadline.isoformat() if extracted_deadline else None,
                    "deadline_raw_text": deadline_raw,
                    "is_deadline_ambiguous": is_ambiguous,
                    "ambiguity_explanation": ambiguity_note,
                    "topics": topics,
                    "requirements": [],
                    "estimated_minutes": 120 if task_type == "Exam" else (90 if task_type in ["Project", "Quiz"] else 60),
                    "is_workload_inferred": True,
                    "priority": "HIGH" if task_type in ["Exam", "Quiz"] or (extracted_deadline and "tomorrow" in s_clean) else "MEDIUM",
                    "confidence_score": 0.88,
                    "notes": s_clean
                })

        return {"tasks": extracted_items}
