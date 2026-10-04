from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.notification import Notification


class NotificationService:
    @staticmethod
    def generate_smart_notifications(db: Session, user_id: str) -> List[Notification]:
        now = datetime.utcnow()
        tasks = (
            db.query(Task)
            .filter(
                Task.user_id == user_id,
                Task.status != "completed",
                Task.progress < 100,
                Task.deadline.isnot(None)
            )
            .all()
        )

        created_notifs = []
        for t in tasks:
            diff_hours = (t.deadline - now).total_seconds() / 3600.0
            
            # Check if notification already exists for this task recently
            existing = (
                db.query(Notification)
                .filter(
                    Notification.user_id == user_id,
                    Notification.title.like(f"%{t.title}%"),
                    Notification.is_read == False
                )
                .first()
            )
            if existing:
                continue

            if 0 < diff_hours <= 28:
                rem_hours = round(t.remaining_minutes / 60.0, 1)
                rem_text = f"{rem_hours} hours" if rem_hours >= 1 else f"{t.remaining_minutes} minutes"
                
                # Context-aware smart notification text conforming to Section 38
                msg = (
                    f"Your {t.title} is due in {int(diff_hours)} hours. "
                    f"You are {t.progress}% complete and have approximately {rem_text} remaining. "
                    f"Starting now keeps you on schedule."
                )

                notif = Notification(
                    user_id=user_id,
                    title=f"Upcoming Deadline: {t.title}",
                    message=msg,
                    notification_type="deadline_reminder",
                    urgency="critical" if diff_hours <= 12 else "warning",
                    action_url=f"/tasks",
                    is_read=False
                )
                db.add(notif)
                created_notifs.append(notif)

        if created_notifs:
            db.commit()

        # Return all unread notifications
        return (
            db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(10)
            .all()
        )
