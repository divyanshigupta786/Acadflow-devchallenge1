from datetime import datetime
from typing import Optional, Tuple


class PriorityEngine:
    """
    Deterministic Task Priority Engine as specified in Section 16.
    
    Priority Score = (Urgency + Importance + Workload + Dependency Risk + Exam Proximity)
                     -------------------------------------------------------------------
                                          Completion Progress Factor
                                          
    Classification:
      RED = Critical   (Score >= 75)
      ORANGE = High    (50 <= Score < 75)
      YELLOW = Medium  (25 <= Score < 50)
      GREEN = Low      (Score < 25)
    """

    @staticmethod
    def calculate_task_priority(
        title: str,
        task_type: str,
        deadline: Optional[datetime],
        remaining_minutes: int,
        progress: int, # 0 to 100
        blocks_count: int = 0, # tasks dependent on this
        has_upcoming_exam: bool = False,
        now: Optional[datetime] = None
    ) -> Tuple[str, float, str]:
        if now is None:
            now = datetime.utcnow()

        # If already 100% completed, priority is Low/Completed
        if progress >= 100:
            return "LOW", 0.0, f"'{title}' is 100% complete."

        # 1. Urgency Score (0 - 35 points)
        urgency_score = 10.0
        hours_to_deadline = None
        urgency_reason = "No explicit deadline"

        if deadline:
            time_diff = (deadline - now).total_seconds() / 3600.0
            hours_to_deadline = time_diff
            if time_diff <= 0:
                urgency_score = 35.0
                urgency_reason = "Overdue"
            elif time_diff <= 24:
                urgency_score = 35.0
                urgency_reason = f"due in {int(time_diff)} hours"
            elif time_diff <= 48:
                urgency_score = 28.0
                urgency_reason = f"due in {int(time_diff)} hours"
            elif time_diff <= 96: # 4 days
                urgency_score = 20.0
                urgency_reason = f"due in {int(time_diff / 24)} days"
            elif time_diff <= 168: # 7 days
                urgency_score = 12.0
                urgency_reason = f"due in {int(time_diff / 24)} days"
            else:
                urgency_score = 5.0
                urgency_reason = f"due in {int(time_diff / 24)} days"

        # 2. Importance Score based on academic task type (0 - 25 points)
        type_upper = (task_type or "ASSIGNMENT").upper()
        if "EXAM" in type_upper or "MIDTERM" in type_upper or "FINAL" in type_upper:
            importance_score = 25.0
        elif "QUIZ" in type_upper or "VIVA" in type_upper or "TEST" in type_upper:
            importance_score = 22.0
        elif "PROJECT" in type_upper or "PRESENTATION" in type_upper:
            importance_score = 20.0
        elif "LAB" in type_upper or "ASSIGNMENT" in type_upper:
            importance_score = 16.0
        elif "REVISION" in type_upper or "READING" in type_upper:
            importance_score = 10.0
        else:
            importance_score = 8.0

        # 3. Workload Score (0 - 20 points)
        workload_hours = max(0, remaining_minutes) / 60.0
        if workload_hours >= 4.0:
            workload_score = 20.0
        elif workload_hours >= 2.5:
            workload_score = 16.0
        elif workload_hours >= 1.5:
            workload_score = 12.0
        elif workload_hours >= 0.75:
            workload_score = 8.0
        else:
            workload_score = 4.0

        # 4. Dependency Risk Score (0 - 15 points)
        if blocks_count > 1:
            dependency_score = 15.0
        elif blocks_count == 1:
            dependency_score = 10.0
        else:
            dependency_score = 0.0

        # 5. Exam Proximity Score (0 - 15 points)
        exam_proximity_score = 15.0 if has_upcoming_exam else 0.0

        # Numerator sum (0 to 110)
        numerator = urgency_score + importance_score + workload_score + dependency_score + exam_proximity_score

        # Completion Progress Factor divisor:
        # progress 0% -> divisor = 1.0 (full weight)
        # progress 50% -> divisor = 1.35
        # progress 90% -> divisor = 1.70
        progress_clamped = max(0, min(100, progress))
        progress_divisor = 1.0 + (progress_clamped / 100.0) * 0.75

        raw_score = numerator / progress_divisor

        # Normalize score to 0 - 100 scale
        priority_score = round(min(100.0, max(5.0, raw_score)), 1)

        # Classification
        if priority_score >= 75.0:
            priority_label = "CRITICAL"
        elif priority_score >= 50.0:
            priority_label = "HIGH"
        elif priority_score >= 25.0:
            priority_label = "MEDIUM"
        else:
            priority_label = "LOW"

        # Generate descriptive explanation
        workload_str = f"{round(workload_hours, 1)} hours" if workload_hours >= 1.0 else f"{remaining_minutes} minutes"
        if hours_to_deadline is not None:
            if hours_to_deadline <= 0:
                explanation = f"{title} is {priority_label.lower()} because it is overdue ({progress}% done, {workload_str} remaining)."
            else:
                explanation = f"{title} is {priority_label.lower()} because it is {urgency_reason}, is {progress}% complete, and requires approximately {workload_str} of work."
        else:
            explanation = f"{title} has {priority_label.lower()} priority based on estimated effort ({workload_str}) and academic weight ({task_type})."

        if blocks_count > 0:
            explanation += f" It blocks {blocks_count} other task{'s' if blocks_count > 1 else ''}."
        if has_upcoming_exam:
            explanation += " Subject has an exam approaching soon."

        return priority_label, priority_score, explanation
