"""
backend/api/applications/service.py
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import UUID, uuid4

from models import Application, Resume, Job, PipelineStage
from ai.matching.job_matcher import JobMatcher, ScoreCalculator
from ai.benchmark.comparator import BenchmarkComparator

matcher    = JobMatcher()
calculator = ScoreCalculator()
benchmark  = BenchmarkComparator()


def apply_to_job(
    user_id:   UUID,
    job_id:    UUID,
    resume_id: UUID = None,
    db:        Session = None,
) -> Application:
    # prevent duplicate applications
    existing = db.query(Application).filter(
        Application.user_id == user_id,
        Application.job_id  == job_id,
    ).first()
    if existing:
        raise HTTPException(409, "Already applied to this job")

    # resolve resume
    if resume_id:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
    else:
        resume = db.query(Resume).filter(
            Resume.user_id == user_id,
            Resume.is_active == True,
        ).first()

    if not resume:
        raise HTTPException(400, "No resume found. Please upload your resume first.")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job or not job.is_active:
        raise HTTPException(404, "Job not found or closed")

    # compute match + benchmark scores
    match_score = None
    if resume.embedding and job.embedding:
        from numpy import dot
        from numpy.linalg import norm
        a, b = resume.embedding, job.embedding
        semantic = float(dot(a, b) / (norm(a) * norm(b) + 1e-9))
        exp_years = (resume.parsed_data or {}).get("total_experience_years", 0)
        match_score = calculator.calculate(semantic, resume.ats_score or 50, 0, exp_years)

    benchmark_result = benchmark.compare(str(resume.id), job.title, db)
    bench_score = benchmark_result.get("percentile")

    app = Application(
        id=uuid4(),
        user_id=user_id,
        job_id=job_id,
        resume_id=resume.id,
        current_stage=PipelineStage.APPLIED,
        highest_stage=PipelineStage.APPLIED,
        match_score=match_score,
        benchmark_score=bench_score,
        ats_passed=None,
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


def get_user_applications(user_id: UUID, db: Session) -> list[Application]:
    return (
        db.query(Application)
        .filter(Application.user_id == user_id)
        .order_by(Application.created_at.desc())
        .all()
    )


def get_application_detail(app_id: UUID, user_id: UUID, db: Session) -> Application:
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(404, "Application not found")
    if app.user_id != user_id:
        raise HTTPException(403, "Not your application")
    return app