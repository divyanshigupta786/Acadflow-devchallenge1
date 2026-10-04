import pytest
from app.ai.extraction.rules import AntiHallucinationRules
from app.ai.providers.fallback import DeterministicFallbackProvider


@pytest.mark.asyncio
async def test_extraction_missing_deadline_is_null():
    text = "Read chapter 4 and chapter 5 of Operating Systems textbook."
    provider = DeterministicFallbackProvider()
    result = await provider.generate_json(prompt=text)

    tasks = result.get("tasks", [])
    assert len(tasks) >= 1
    task = tasks[0]
    # Verify no deadline was invented
    assert task.get("deadline") is None


@pytest.mark.asyncio
async def test_extraction_explicit_deadline_detected():
    text = "DBMS assignment due tomorrow at 5 PM. Submit SQL queries."
    provider = DeterministicFallbackProvider()
    result = await provider.generate_json(prompt=text)

    tasks = result.get("tasks", [])
    assert len(tasks) >= 1
    task = tasks[0]
    assert task.get("deadline") is not None
    assert "tomorrow" in (task.get("deadline_raw_text") or "").lower()


def test_anti_hallucination_rules_cleans_fabricated_deadline():
    raw_task = {
        "title": "Discrete Math Notes",
        "deadline": "2026-10-15T12:00:00",
        "deadline_raw_text": None,  # No textual ground in input!
        "estimated_minutes": 60
    }
    validated = AntiHallucinationRules.validate_extracted_task(raw_task)
    assert validated["deadline"] is None
    assert validated["is_workload_inferred"] is True
