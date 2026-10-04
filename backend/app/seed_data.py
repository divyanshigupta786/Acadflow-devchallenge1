from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from app.models.user import User, StudentPreference, AIMemory
from app.models.course import Course
from app.models.task import Task, TaskDependency
from app.models.schedule import ScheduleBlock, StudySession
from app.models.goal import Goal
from app.models.project import Project, ProjectMember, ProjectTask
from app.models.document import Document, DocumentChunk
from app.models.notification import Notification
from app.services.auth_service import AuthService
from app.ai.rag.embeddings import EmbeddingService
from app.services.priority_service import PriorityEngine


def seed_demo_data(db: Session) -> User:
    """
    Seeds a realistic demo student matching Section 42 of AcadFlow specification.
    """
    # Check if demo user already exists
    demo_user = db.query(User).filter(User.email == "demo@acadflow.dev").first()
    if demo_user:
        return demo_user

    # 1. Create Demo Student
    demo_user = User(
        email="demo@acadflow.dev",
        hashed_password=AuthService.get_password_hash("demo123"),
        full_name="Alex Chen",
        is_active=True
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    # 2. Student Preferences & Learning Memory
    pref = StudentPreference(
        user_id=demo_user.id,
        preferred_study_duration=45,
        break_duration=15,
        preferred_study_time="morning",
        available_daily_hours=4.0,
        strong_subjects=["OSI Model", "TCP/IP", "Relational Algebra", "Trees"],
        weak_subjects=["Subnetting", "Concurrency Semaphores", "B+ Trees"],
        typical_task_completion_factor=1.1,
        programming_task_multiplier=1.3,
        reading_task_multiplier=0.95
    )
    db.add(pref)

    ai_mem = AIMemory(
        user_id=demo_user.id,
        memory_type="pattern",
        key="programming_estimation",
        value="Takes ~30% longer than planned on hands-on coding tasks.",
        confidence=0.92
    )
    db.add(ai_mem)

    # 3. Courses
    courses_data = [
        {
            "name": "Database Management Systems", "code": "CS301", "instructor": "Dr. Sarah Miller",
            "color": "#8b5cf6", "credits": 4, "progress": 62.0,
            "syllabus_topics": ["Relational Model", "SQL", "Normalization", "Indexing & B+ Trees", "Transactions"],
            "strong_areas": ["SQL Queries", "Relational Algebra"],
            "weak_areas": ["B+ Trees", "2-Phase Locking"]
        },
        {
            "name": "Computer Networks", "code": "CS302", "instructor": "Prof. Alan Turing",
            "color": "#06b6d4", "credits": 4, "progress": 68.0,
            "syllabus_topics": ["OSI Reference Model", "TCP/IP Suite", "Subnetting & CIDR", "Routing Protocols", "Congestion Control"],
            "strong_areas": ["OSI Model", "TCP/IP"],
            "weak_areas": ["Subnetting", "Congestion Control"]
        },
        {
            "name": "Operating Systems", "code": "CS303", "instructor": "Dr. Dennis Ritchie",
            "color": "#f59e0b", "credits": 4, "progress": 54.0,
            "syllabus_topics": ["Process Scheduling", "Semaphores & Locks", "Virtual Memory", "Deadlocks", "File Systems"],
            "strong_areas": ["Process Lifecycle", "CPU Scheduling"],
            "weak_areas": ["Semaphore Concurrency", "Page Replacement"]
        },
        {
            "name": "Data Structures & Algorithms", "code": "CS201", "instructor": "Prof. Donald Knuth",
            "color": "#3b82f6", "credits": 4, "progress": 82.0,
            "syllabus_topics": ["Dynamic Arrays", "Linked Lists", "Balanced Trees", "Graph Algorithms", "Dynamic Programming"],
            "strong_areas": ["Binary Search", "Trees", "Sorting"],
            "weak_areas": ["Dynamic Programming"]
        },
        {
            "name": "Discrete Mathematics", "code": "MATH202", "instructor": "Dr. Katherine Johnson",
            "color": "#ec4899", "credits": 3, "progress": 70.0,
            "syllabus_topics": ["Propositional Logic", "Set Theory", "Combinatorics", "Graph Theory", "Recurrence Relations"],
            "strong_areas": ["Logic", "Sets"],
            "weak_areas": ["Recurrence Relations"]
        }
    ]

    course_map = {}
    for c in courses_data:
        course = Course(user_id=demo_user.id, **c)
        db.add(course)
        db.commit()
        db.refresh(course)
        course_map[course.code] = course

    now = datetime.utcnow()

    # 4. Realistic Tasks (10 assignments + 3 exams + project tasks)
    tasks_data = [
        # Critical upcoming
        {
            "course": "CS302", "title": "Computer Networks Quiz Preparation", "task_type": "Quiz",
            "deadline": now + timedelta(hours=18), "estimated_minutes": 90, "remaining_minutes": 27,
            "actual_minutes": 60, "progress": 70, "status": "in_progress", "difficulty": "hard",
            "topics": ["OSI Model", "TCP/IP", "Subnetting"]
        },
        {
            "course": "CS301", "title": "DBMS Assignment 3: Relational Normalization", "task_type": "Assignment",
            "deadline": now + timedelta(hours=28), "estimated_minutes": 120, "remaining_minutes": 72,
            "actual_minutes": 48, "progress": 40, "status": "in_progress", "difficulty": "medium",
            "topics": ["3NF", "BCNF", "Dependency Preservation"]
        },
        {
            "course": "CS302", "title": "Project Presentation: Network Topology", "task_type": "Presentation",
            "deadline": now + timedelta(hours=24), "estimated_minutes": 90, "remaining_minutes": 36,
            "actual_minutes": 54, "progress": 60, "status": "in_progress", "difficulty": "medium",
            "topics": ["WAN Architecture", "Latency Benchmarks"]
        },
        {
            "course": "CS303", "title": "Operating Systems Concurrency Lab", "task_type": "Lab",
            "deadline": now + timedelta(days=3), "estimated_minutes": 150, "remaining_minutes": 120,
            "actual_minutes": 30, "progress": 20, "status": "in_progress", "difficulty": "hard",
            "topics": ["POSIX Mutex", "Deadlock Prevention"]
        },
        {
            "course": "MATH202", "title": "Mathematics Midterm Exam Revision", "task_type": "Exam",
            "deadline": now + timedelta(days=5), "estimated_minutes": 240, "remaining_minutes": 180,
            "actual_minutes": 60, "progress": 25, "status": "in_progress", "difficulty": "hard",
            "topics": ["Combinatorics", "Graph Theory", "Recurrences"]
        },
        {
            "course": "CS301", "title": "DBMS Query Optimization Benchmarking", "task_type": "Assignment",
            "deadline": now + timedelta(days=6), "estimated_minutes": 90, "remaining_minutes": 90,
            "actual_minutes": 0, "progress": 0, "status": "pending", "difficulty": "medium",
            "topics": ["B+ Tree Indexes", "EXPLAIN ANALYZE"]
        },
        {
            "course": "CS302", "title": "Wireshark Packet Analysis Report", "task_type": "Lab",
            "deadline": now + timedelta(days=7), "estimated_minutes": 90, "remaining_minutes": 90,
            "actual_minutes": 0, "progress": 0, "status": "pending", "difficulty": "easy",
            "topics": ["TCP Handshake", "DNS Packets"]
        },
        {
            "course": "CS303", "title": "Operating Systems Midterm Exam", "task_type": "Exam",
            "deadline": now + timedelta(days=8), "estimated_minutes": 240, "remaining_minutes": 240,
            "actual_minutes": 0, "progress": 0, "status": "pending", "difficulty": "hard",
            "topics": ["Processes", "Threads", "Scheduling", "Deadlocks"]
        },
        # Completed historical tasks
        {
            "course": "CS201", "title": "DSA Assignment: AVL Tree Implementation", "task_type": "Assignment",
            "deadline": now - timedelta(days=2), "estimated_minutes": 120, "remaining_minutes": 0,
            "actual_minutes": 140, "progress": 100, "status": "completed", "difficulty": "hard",
            "topics": ["Tree Rotations", "Balance Factor"]
        },
        {
            "course": "CS303", "title": "Operating Systems System Calls Lab", "task_type": "Lab",
            "deadline": now - timedelta(days=4), "estimated_minutes": 90, "remaining_minutes": 0,
            "actual_minutes": 85, "progress": 100, "status": "completed", "difficulty": "medium",
            "topics": ["fork", "exec", "waitpid"]
        },
        {
            "course": "CS201", "title": "DSA Graph Traversal Problem Set", "task_type": "Assignment",
            "deadline": now - timedelta(days=6), "estimated_minutes": 90, "remaining_minutes": 0,
            "actual_minutes": 95, "progress": 100, "status": "completed", "difficulty": "medium",
            "topics": ["BFS", "DFS", "Dijkstra"]
        },
        {
            "course": "MATH202", "title": "Discrete Math Logic Problem Set 2", "task_type": "Assignment",
            "deadline": now - timedelta(days=8), "estimated_minutes": 60, "remaining_minutes": 0,
            "actual_minutes": 55, "progress": 100, "status": "completed", "difficulty": "easy",
            "topics": ["Truth Tables", "Predicate Calculus"]
        },
    ]

    created_tasks = []
    for td in tasks_data:
        c_code = td.pop("course")
        course = course_map.get(c_code)
        
        p_label, p_score, p_exp = PriorityEngine.calculate_task_priority(
            title=td["title"],
            task_type=td["task_type"],
            deadline=td["deadline"],
            remaining_minutes=td["remaining_minutes"],
            progress=td["progress"],
            has_upcoming_exam=c_code in ["CS302", "MATH202", "CS303"]
        )

        task = Task(
            user_id=demo_user.id,
            course_id=course.id if course else None,
            priority=p_label,
            priority_score=p_score,
            priority_explanation=p_exp,
            is_inferred=False,
            **td
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        created_tasks.append(task)

    # 5. Schedule Blocks for Today (Section 13 layout)
    today = date.today()
    cn_task = next(t for t in created_tasks if "Networks Quiz" in t.title)
    dbms_task = next(t for t in created_tasks if "DBMS Assignment" in t.title)
    pres_task = next(t for t in created_tasks if "Presentation" in t.title)

    sched_blocks = [
        ScheduleBlock(
            user_id=demo_user.id, task_id=cn_task.id, title="Computer Networks Quiz Preparation",
            subject_name="Computer Networks", plan_date=today, start_time="10:00", end_time="11:30",
            duration_minutes=90, priority="CRITICAL", plan_version="current"
        ),
        ScheduleBlock(
            user_id=demo_user.id, task_id=None, title="Rest & Recharge Break",
            subject_name="Break", plan_date=today, start_time="11:30", end_time="11:45",
            duration_minutes=15, priority="LOW", is_break=True, plan_version="current"
        ),
        ScheduleBlock(
            user_id=demo_user.id, task_id=dbms_task.id, title="DBMS Assignment 3: Normalization",
            subject_name="Database Management Systems", plan_date=today, start_time="11:45", end_time="12:45",
            duration_minutes=60, priority="CRITICAL", plan_version="current"
        ),
        ScheduleBlock(
            user_id=demo_user.id, task_id=pres_task.id, title="Project Presentation Slides",
            subject_name="Computer Networks", plan_date=today, start_time="15:00", end_time="16:00",
            duration_minutes=60, priority="HIGH", plan_version="current"
        ),
    ]
    db.add_all(sched_blocks)

    # 6. Projects & Blocker Intelligence (Section 29)
    proj = Project(
        user_id=demo_user.id,
        title="AI Attendance System",
        description="Facial recognition and geofenced attendance system for campus laboratories.",
        deadline=now + timedelta(days=20),
        status="active"
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)

    members = [
        ProjectMember(project_id=proj.id, name="Alex Chen", role="Backend Engineer", email="alex@univ.edu"),
        ProjectMember(project_id=proj.id, name="Sara Connor", role="Frontend Developer", email="sara@univ.edu"),
        ProjectMember(project_id=proj.id, name="Liam Vance", role="ML / Vision Engineer", email="liam@univ.edu"),
        ProjectMember(project_id=proj.id, name="Zoe Adams", role="Documentation & Testing", email="zoe@univ.edu"),
    ]
    db.add_all(members)

    proj_tasks = [
        ProjectTask(project_id=proj.id, title="FastAPI Authentication & JWT Endpoint", assignee_name="Alex Chen", status="completed"),
        ProjectTask(
            project_id=proj.id, title="Face Embedding Pipeline with OpenCV", assignee_name="Liam Vance",
            status="in_progress", deadline=now + timedelta(days=5)
        ),
        ProjectTask(
            project_id=proj.id, title="Student Dashboard Camera Feed Integration", assignee_name="Sara Connor",
            status="todo", is_blocked=True, blocker_reason="Waiting for Face Embedding API endpoint from ML module.",
            blocked_by_task_title="Face Embedding Pipeline with OpenCV", deadline=now + timedelta(days=7)
        ),
        ProjectTask(project_id=proj.id, title="System Architecture & API Docs", assignee_name="Zoe Adams", status="in_progress")
    ]
    db.add_all(proj_tasks)

    # 7. Goals (Section 27)
    goal1 = Goal(
        user_id=demo_user.id,
        title="Score 85%+ in Semester Midterms",
        description="Achieve top tier academic performance across CS301, CS302, and CS303.",
        category="Academic",
        target_date=now + timedelta(days=14),
        progress=65,
        milestones=[
            {"id": 1, "title": "Complete all DBMS normalization practice problems", "completed": True},
            {"id": 2, "title": "Revise Computer Networks OSI & TCP/IP subnetting", "completed": True},
            {"id": 3, "title": "Implement semaphore locking simulations in OS", "completed": False},
            {"id": 4, "title": "Complete 3 full mock exams under timed conditions", "completed": False}
        ]
    )
    goal2 = Goal(
        user_id=demo_user.id,
        title="Complete Full-Stack & System Design Roadmap",
        description="Master modern backend architecture, caching, and open-source AI integrations.",
        category="Career",
        target_date=now + timedelta(days=45),
        progress=40,
        milestones=[
            {"id": 1, "title": "Build modular FastAPI service architecture", "completed": True},
            {"id": 2, "title": "Implement RAG vector search with pgvector", "completed": True},
            {"id": 3, "title": "Deploy Ollama local open-source LLM pipeline", "completed": True},
            {"id": 4, "title": "Publish open-source academic productivity platform", "completed": False}
        ]
    )
    db.add_all([goal1, goal2])

    # 8. Knowledge Base Documents & Chunks for RAG (Section 22, 23)
    cn_course = course_map["CS302"]
    doc1 = Document(
        user_id=demo_user.id,
        course_id=cn_course.id,
        title="Computer Networks Quiz 1 Study Guide (Chapters 3 & 4)",
        filename="CN_Quiz1_Study_Guide.pdf",
        file_type="pdf",
        file_size_bytes=420000,
        summary="Comprehensive notes on OSI vs TCP/IP models, packet encapsulation, CIDR subnetting, and TCP three-way handshake."
    )
    db.add(doc1)
    db.commit()
    db.refresh(doc1)

    doc1_texts = [
        "Chapter 3: The OSI model consists of 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. In contrast, the TCP/IP stack condenses these into Network Access, Internet (IP), Transport (TCP/UDP), and Application. Packet encapsulation adds headers at each descending layer.",
        "Chapter 3.4: TCP vs UDP. TCP is connection-oriented, reliable, with sequence numbers and flow control. The 3-way handshake comprises SYN, SYN-ACK, and ACK packets. UDP is connectionless, lightweight, best-effort without guaranteed delivery.",
        "Chapter 4: IPv4 Subnetting and CIDR. A /24 mask provides 256 addresses (254 usable hosts, subtracting network and broadcast addresses). Subnetting divides large address spaces into smaller logical broadcast domains, reducing congestion and improving routing table efficiency.",
        "Chapter 4.6: TCP Congestion Control mechanisms include Slow Start, Congestion Avoidance, Fast Retransmit, and Fast Recovery. AIMD (Additive Increase Multiplicative Decrease) is the core algorithm regulating window size cwnd."
    ]

    for idx, text in enumerate(doc1_texts):
        chunk = DocumentChunk(
            document_id=doc1.id,
            chunk_index=idx,
            content=text,
            token_count=len(text.split()),
            page_number=idx + 1,
            embedding_json=EmbeddingService.get_text_embedding(text)
        )
        db.add(chunk)

    # 9. Smart Initial Notification
    notif = Notification(
        user_id=demo_user.id,
        title="Upcoming Deadline: Computer Networks Quiz",
        message="Your Computer Networks Quiz is due in 18 hours. You are 70% complete and have approximately 27 minutes remaining. Starting now keeps you on schedule.",
        notification_type="deadline_reminder",
        urgency="critical",
        action_url="/planner",
        is_read=False
    )
    db.add(notif)

    db.commit()
    return demo_user
