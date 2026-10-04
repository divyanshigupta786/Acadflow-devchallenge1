from datetime import datetime
from typing import Optional, Dict, Any


class AntiHallucinationRules:
    """
    Section 8: AI MUST NOT HALLUCINATE ACADEMIC DATA.
    - If a deadline is not explicitly present: deadline = null
    - If an AI inference is made, label it clearly: "AI estimate" / "Inferred"
    - If information is ambiguous, set is_deadline_ambiguous=True and provide note.
    """

    @staticmethod
    def validate_extracted_task(task_dict: Dict[str, Any]) -> Dict[str, Any]:
        # Validate deadline
        deadline_val = task_dict.get("deadline")
        deadline_raw = task_dict.get("deadline_raw_text")

        # If model gave a deadline without any textual source, discard it
        if deadline_val and not deadline_raw:
            task_dict["deadline"] = None
            task_dict["is_deadline_ambiguous"] = False
            task_dict["ambiguity_explanation"] = "No deadline mentioned in source text."

        # Mark inference flag
        task_dict["is_workload_inferred"] = True
        task_dict["is_inferred"] = bool(task_dict.get("deadline") or task_dict.get("estimated_minutes"))

        # Bounds check estimated minutes (15 mins to 8 hours)
        est = task_dict.get("estimated_minutes", 60)
        if not isinstance(est, int) or est <= 0:
            task_dict["estimated_minutes"] = 60
        else:
            task_dict["estimated_minutes"] = max(15, min(480, est))

        return task_dict
