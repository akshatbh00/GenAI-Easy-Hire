"""
api/jobs/service.py — CRUD + search + embedding for job postings
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import UUID, uuid4

from models import Job, Company, Recruiter
from ai.resume.embedder import ResumeEmbedder
from api.jobs.schemas import JobCreateRequest, JobUpdateRequest

embedder = ResumeEmbedder()


# def create_job(
#     payload: JobCreateRequest,
#     recruiter_user_id: UUID,
#     db: Session,
# ) -> Job:
#     # verify recruiter belongs to a company
#     rec = db.query(Recruiter).filter(Recruiter.user_id == recruiter_user_id).first()
#     if not rec:
#         raise HTTPException(403, "You are not linked to any company")

#     # embed the JD for semantic matching
#     jd_text   = f"{payload.title}\n{payload.description}\n{' '.join(payload.requirements)}"
#     embedding = embedder.embed_job_description(jd_text)

#     job = Job(
#         id=str(uuid4()),
#         company_id=rec.company_id,
#         title=payload.title,
#         description=payload.description,
#         requirements=payload.requirements,
#         job_type=payload.job_type,
#         location=payload.location,
#         remote_ok=payload.remote_ok,
#         salary_min=payload.salary_min,
#         salary_max=payload.salary_max,
#         embedding=embedding,
#     )
#     db.add(job)
#     db.commit()
#     db.refresh(job)
#     return job
def create_job(
    payload: JobCreateRequest,
    recruiter_user_id: UUID,
    db: Session,
) -> Job:
    rec = db.query(Recruiter).filter(Recruiter.user_id == str(recruiter_user_id)).first()
    if not rec:
        raise HTTPException(403, "You are not linked to any company")

    # embed JD only if OpenAI key available
    embedding = None
    try:
        jd_text   = f"{payload.title}\n{payload.description}\n{' '.join(payload.requirements)}"
        embedding = embedder.embed_job_description(jd_text)
    except Exception:
        pass   # skip embedding in dev without OpenAI key

    job = Job(
        id=str(uuid4()),
        company_id=str(rec.company_id),
        title=payload.title,
        description=payload.description,
        requirements=payload.requirements,
        job_type=payload.job_type,
        location=payload.location,
        remote_ok=payload.remote_ok,
        salary_min=payload.salary_min,
        salary_max=payload.salary_max,
        embedding=embedding,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

def update_job(job_id: UUID, payload: JobUpdateRequest, db: Session) -> Job:
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(job, field, val)
    db.commit()
    db.refresh(job)
    return job


def get_job(job_id: UUID, db: Session) -> Job:
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    return job


def list_jobs(
    db: Session,
    job_type: str = None,
    location: str = None,
    remote_ok: bool = None,
    search: str = None,
    skip: int = 0,
    limit: int = 20,
) -> list[Job]:
    q = db.query(Job).filter(Job.is_active == True)
    if job_type:   q = q.filter(Job.job_type == job_type)
    if remote_ok:  q = q.filter(Job.remote_ok == True)
    if location:   q = q.filter(Job.location.ilike(f"%{location}%"))
    if search:     q = q.filter(
                        Job.title.ilike(f"%{search}%") |
                        Job.description.ilike(f"%{search}%")
                    )
    return q.offset(skip).limit(limit).all()


def delete_job(job_id: UUID, db: Session):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    job.is_active = False   # soft delete
    db.commit()