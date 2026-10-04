from app.services.workload_service import WorkloadService
from app.models.user import StudentPreference


def test_workload_baseline_by_type():
    exam_res = WorkloadService.estimate_initial_workload("Exam", "Midterm Exam Preparation", "medium")
    assign_res = WorkloadService.estimate_initial_workload("Assignment", "Math Problem Set", "medium")

    assert exam_res["estimated_minutes"] > assign_res["estimated_minutes"]
    assert exam_res["is_inferred"] is True


def test_workload_difficulty_scaling():
    easy_res = WorkloadService.estimate_initial_workload("Assignment", "Basic Syntax", "easy")
    hard_res = WorkloadService.estimate_initial_workload("Assignment", "Complex Concurrency", "hard")

    assert hard_res["estimated_minutes"] > easy_res["estimated_minutes"]


def test_personalized_programming_multiplier():
    pref = StudentPreference(programming_task_multiplier=1.35)
    coding_res = WorkloadService.estimate_initial_workload("Assignment", "DBMS SQL implementation", "medium", pref)
    theory_res = WorkloadService.estimate_initial_workload("Assignment", "History of Computing Essay", "medium", pref)

    # Coding task should apply the 1.35x multiplier
    assert coding_res["applied_multiplier"] == 1.35
    assert theory_res["applied_multiplier"] == 1.0
    assert coding_res["estimated_minutes"] > theory_res["estimated_minutes"]
