from celery import Celery
from config import settings

celery_app = Celery(
    "hireflow",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "workers.resume_tasks",
        "workers.matching_tasks",
        "workers.notification_tasks",
        "workers.benchmark_tasks",
    ]
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    worker_prefetch_multiplier=1,    # fairness for long tasks
    task_acks_late=True,
)