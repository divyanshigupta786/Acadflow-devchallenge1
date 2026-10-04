import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db, SessionLocal
from app.seed_data import seed_demo_data

from app.api.auth import router as auth_router
from app.api.inbox import router as inbox_router
from app.api.tasks import router as tasks_router
from app.api.courses import router as courses_router
from app.api.schedule import router as schedule_router
from app.api.knowledge import router as knowledge_router
from app.api.goals import router as goals_router
from app.api.projects import router as projects_router
from app.api.analytics import router as analytics_router
from app.api.notifications import router as notifications_router
from app.api.settings import router as settings_router
from app.api.ai import router as ai_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("acadflow")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing AcadFlow Database & Tables...")
    init_db()

    # Automatically seed realistic demo student
    db = SessionLocal()
    try:
        demo_user = seed_demo_data(db)
        logger.info(f"AcadFlow Demo Student seeded successfully: {demo_user.email}")
    except Exception as e:
        logger.warning(f"Demo seeding warning: {e}")
    finally:
        db.close()

    yield
    logger.info("AcadFlow Backend shutting down.")


app = FastAPI(
    title="AcadFlow API",
    description="AI-powered academic productivity and adaptive planning platform.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all feature routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(inbox_router, prefix=settings.API_V1_STR)
app.include_router(tasks_router, prefix=settings.API_V1_STR)
app.include_router(courses_router, prefix=settings.API_V1_STR)
app.include_router(schedule_router, prefix=settings.API_V1_STR)
app.include_router(knowledge_router, prefix=settings.API_V1_STR)
app.include_router(goals_router, prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "name": "AcadFlow API",
        "tagline": "From academic chaos to clarity.",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "demo_account": {
            "email": "demo@acadflow.dev",
            "password": "demo123"
        }
    }
