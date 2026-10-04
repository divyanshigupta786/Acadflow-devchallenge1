# AcadFlow — AI-Powered Academic Operating System

> **From academic chaos to clarity.**

AcadFlow is a production-quality, open-source AI academic productivity and planning platform. Designed for college and university students managing multiple courses, assignments, exams, projects, and extracurriculars, AcadFlow transforms fragmented academic information into an adaptive, personalized action plan.

---

## 1. Product Philosophy: Not Another Chatbot

Students do not have a lack of academic information; they have an **academic information overload problem**. Academic information is scattered across:
* WhatsApp messages
* Google Classroom
* College ERP & Portals
* Emails & PDFs
* Screenshots & handwritten notes
* Project chat threads

**AcadFlow replaces manual planning with an academic decision and planning engine powered by open-source AI.**

### The Core Loop
```
INPUT ──► UNDERSTAND ──► PRIORITIZE ──► PLAN ──► EXECUTE ──► MONITOR ──► REPLAN
```

---

## 2. Signature Feature: Adaptive Replanning

When a student reports:
> *"I only completed 45 minutes of DBMS."* or *"I lost 2 hours today."*

AcadFlow does **not** simply mark the task incomplete. The Adaptive Replanning Engine:
1. Calculates remaining workload for the affected task.
2. Checks available time remaining in the day.
3. Recalculates task priorities across the active syllabus.
4. Checks upcoming deadlines.
5. Identifies low-priority tasks that can be safely shifted to tomorrow.
6. Rebuilds the schedule to preserve high-stakes exam revisions.
7. Explains the trade-offs in transparent student terms:

> *"Your DBMS assignment took longer than expected. I've moved low-priority project documentation to tomorrow while preserving your Computer Networks revision because the quiz is closer."*

---

## 3. Open-Source AI Architecture & Zero Hallucinations

AcadFlow strictly decouples business logic from AI inference:
* **Configurable Open-Source Models**: Native support for **Ollama** (Qwen 2.5:7b, Llama 3.2, Mistral 7B, Gemma 2) and OpenAI-compatible local endpoints.
* **Strict Anti-Hallucination Policy**: The system **never** invents deadlines. If a deadline is not explicitly present in the input text, `deadline = null`. Inferred estimates are visibly labeled `"AI estimate"`.
* **Graceful Deterministic Fallback**: If the local LLM server is offline, the deterministic NLP extraction and heuristic planning engine executes automatically with zero crashes.
* **Zero Vendor Lock-in**: Full local execution guarantees student privacy without proprietary third-party cloud leakage.

---

## 4. Deterministic Task Priority Engine

Priority is **never** left to arbitrary LLM hallucination. It is calculated by a deterministic backend scoring algorithm:

$$\text{Priority Score} = \frac{\text{Urgency} + \text{Importance} + \text{Workload} + \text{Dependency Risk} + \text{Exam Proximity}}{\text{Completion Progress Factor}}$$

### Urgency Classification
* 🔴 **Critical** ($\ge 75$): Imminent deadline ($<24$h), high academic stakes (Exam/Quiz), overdue.
* 🟠 **High** ($50 - 74$): Due within 48 hours or blocking team deliverables.
* 🟡 **Medium** ($25 - 49$): Standard assignments with moderate runway.
* 🟢 **Low / Done** ($< 25$): Extended deadlines, optional readings, or $100\%$ completed.

---

## 5. Workload Learning & Multipliers

Tasks track `estimated_minutes`, `remaining_minutes`, and `actual_minutes`. 
* When tasks are completed, AcadFlow compares planned vs. actual time.
* If a student consistently takes $30\%$ longer on programming or database assignments, the system adjusts future coding task multipliers to $1.3\times$.

---

## 6. Full Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy, Uvicorn |
| **Database** | PostgreSQL + pgvector (production) / SQLite (zero-config local) |
| **AI Inference** | Ollama (Qwen 2.5, Llama 3.2, Mistral, Gemma 2) + Deterministic Fallback |
| **Embeddings & RAG**| Normalized Semantic Vectorizer / BGE embeddings + Cosine retrieval |
| **Containerization** | Docker, Docker Compose |

---

## 7. Database Schema Overview

```
users (id, email, hashed_password, full_name, role, is_active)
├── student_preferences (user_id, study_duration, break_duration, multipliers)
├── courses (id, user_id, name, code, progress, strong_areas, weak_areas)
│   └── documents (id, course_id, title, file_path, summary)
│       └── document_chunks (id, document_id, content, embedding_json)
├── tasks (id, user_id, course_id, title, deadline, priority, estimated_minutes, actual_minutes, progress)
│   └── task_dependencies (id, task_id, depends_on_task_id, is_blocker)
├── schedule_blocks (id, user_id, task_id, plan_date, start_time, end_time, plan_version)
├── projects (id, user_id, title, status)
│   ├── project_members (id, project_id, name, role)
│   └── project_tasks (id, project_id, title, is_blocked, blocker_reason)
└── goals (id, user_id, title, milestones_json, progress)
```

---

## 8. Quickstart & Local Setup

### Prerequisites
* Python 3.10+
* Node.js 18+ & npm
* (Optional) Ollama installed and running for live local LLM inference

### Method A: Docker Compose (One-Command Startup)
```bash
docker-compose up --build
```
* **Frontend**: `http://localhost:3000`
* **FastAPI Backend & Swagger Docs**: `http://localhost:8000/docs`
* **PostgreSQL + pgvector**: `localhost:5432`
* **Ollama**: `http://localhost:11434`

---

### Method B: Manual Local Development

#### 1. Start Backend
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*Database tables and the seeded demo student will initialize automatically on first startup.*

#### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 9. Seeded Realistic Demo Student Account

For immediate testing, click **"Launch Demo"** on the landing page or login with:
* **Email**: `demo@acadflow.dev`
* **Password**: `demo123`

### Pre-loaded Data:
* **5 Courses**: Database Management Systems (CS301), Computer Networks (CS302), Operating Systems (CS303), Data Structures & Algorithms (CS201), Discrete Mathematics (MATH202).
* **12 Realistic Tasks**: Imminent Computer Networks Quiz, DBMS Normalization Assignment, OS Concurrency Lab, completed AVL Tree and System Call labs.
* **Active Daily Schedule**: Focus intervals and breaks pre-allocated.
* **Knowledge Base Documents**: Indexed study guide on OSI vs. TCP/IP and IPv4 CIDR subnetting.
* **Collaborative Project**: "AI Attendance System" with active AI blocker warnings.

---

## 10. Running Automated Tests

```bash
cd backend
pytest -v
```
Included test suites:
* `tests/test_priority_engine.py`: Validates deterministic priority math, urgency factors, and progress divisors.
* `tests/test_extraction.py`: Validates anti-hallucination rules and missing deadline handling.
* `tests/test_workload_estimator.py`: Validates baseline estimation and personalized programming multipliers.
* `tests/test_adaptive_replanning.py`: Validates dynamic schedule adjustment and task preservation.
* `tests/test_auth_and_isolation.py`: Validates password hashing and strict multi-tenant data isolation.

---

## 11. Acceptance Criteria Checklist

- [x] Register, login, and JWT session handling
- [x] One-click seeded demo student account (`demo@acadflow.dev`)
- [x] Academic Inbox supporting raw text, screenshots (OCR), and voice input
- [x] Open-source LLM extraction (Ollama with Qwen/Llama + zero-hallucination fallback)
- [x] Review & edit extracted items before saving to database
- [x] Deterministic Priority Engine with RED/ORANGE/YELLOW/GREEN classification
- [x] Daily planner with available study hour budget selector
- [x] **Signature Feature**: Adaptive Replanning when student reports lost time or partial work
- [x] Workload estimation with historical programming multipliers
- [x] Dedicated course pages with strong/weak topic tracking and AI study recommendations
- [x] Knowledge Base RAG with text chunking, embeddings, and grounded source citations
- [x] Project Mode with team roles and AI blocker warnings
- [x] Long-term Goals with interactive milestone checklists
- [x] Analytics with completion rates, weekly workloads, and grounded pattern insights
- [x] Context-aware smart notifications
- [x] Docker Compose ready with PostgreSQL/pgvector and Ollama

---

## 12. License
MIT License. Built for the academic community.
