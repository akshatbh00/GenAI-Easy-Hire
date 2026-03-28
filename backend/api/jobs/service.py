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

#% JD Match
def get_match_breakdown(
    job_id:  str,
    user_id: str,
    db:      Session,
) -> dict:
    """
    Returns % match breakdown BEFORE applying.
    Shows skills, experience, location match separately.
    """
    from models import Resume, Job

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")

    resume = db.query(Resume).filter(
        Resume.user_id   == user_id,
        Resume.is_active == True,
    ).first()
    if not resume:
        return {
            "overall":    0,
            "skills":     0,
            "experience": 0,
            "location":   0,
            "breakdown":  {},
            "missing_skills": [],
            "message": "Upload a resume to see your match score",
        }

    parsed = resume.parsed_data or {}

    # 1. Skills match
    candidate_skills = set(s.lower() for s in parsed.get("skills", []))
    required_skills  = set(s.lower() for s in (job.requirements or []))
    if required_skills:
        matched_skills  = candidate_skills & required_skills
        missing_skills  = sorted(required_skills - candidate_skills)
        skills_score    = round(len(matched_skills) / len(required_skills) * 100, 1)
    else:
        matched_skills  = set()
        missing_skills  = []
        skills_score    = 70.0   # no requirements = neutral score

    # 2. Experience match (rough heuristic)
    candidate_exp  = parsed.get("total_experience_years", 0) or 0
    # extract years from job description
    import re
    exp_mentions   = re.findall(r"(\d+)\+?\s*years?", (job.description or ""), re.IGNORECASE)
    required_exp   = int(exp_mentions[0]) if exp_mentions else 0
    if required_exp:
        exp_score  = min(100.0, (candidate_exp / required_exp) * 100)
    else:
        exp_score  = 80.0   # no exp mentioned = neutral

    # 3. Location match
    if job.remote_ok:
        location_score = 100.0
    elif job.location and parsed.get("location"):
        job_loc        = job.location.lower()
        cand_loc       = parsed.get("location", "").lower()
        location_score = 100.0 if any(w in job_loc for w in cand_loc.split()) else 40.0
    else:
        location_score = 60.0   # unknown = neutral

    # 4. Weighted overall
    overall = round(
        skills_score    * 0.50 +
        exp_score       * 0.30 +
        location_score  * 0.20,
        1
    )

    return {
        "overall":         overall,
        "skills":          skills_score,
        "experience":      round(exp_score, 1),
        "location":        location_score,
        "matched_skills":  sorted(matched_skills)[:10],
        "missing_skills":  missing_skills[:10],
        "candidate_exp":   candidate_exp,
        "required_exp":    required_exp,
        "remote_ok":       job.remote_ok,
        "breakdown": {
            "skills_weight":     "50%",
            "experience_weight": "30%",
            "location_weight":   "20%",
        }
    }


#to show live jobs to candidates
def list_jobs(db, job_type=None, location=None, remote_ok=None, search=None, skip=0, limit=20):
    q = db.query(Job).filter(
        Job.is_active == True,
        Job.status    == JobStatus.LIVE,   # ← only show approved jobs
    )
    # rest stays the same

from datetime import datetime
from models import Job, Company, Recruiter, JobStatus
from fastapi import HTTPException

#to show pending jobs to recruiters
def get_pending_approvals(db):
    return db.query(Job).filter(
        Job.status == JobStatus.PENDING_APPROVAL,
    ).order_by(Job.created_at.asc()).all()


#to approve jobs
def approve_job(job_id, recruiter_id, db):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")

    rec = db.query(Recruiter).filter(Recruiter.user_id == recruiter_id).first()
    if not rec or rec.company_id != job.company_id:
        raise HTTPException(403, "Not authorized")

    job.status      = JobStatus.LIVE
    job.approved_at = datetime.utcnow()
    db.commit()
    db.refresh(job)

    # TODO: trigger job alerts for matching candidates

    return job


#to reject jobs
def reject_job(job_id, recruiter_id, reason, db):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")

    rec = db.query(Recruiter).filter(Recruiter.user_id == recruiter_id).first()
    if not rec or rec.company_id != job.company_id:
        raise HTTPException(403, "Not authorized")

    job.status      = JobStatus.REJECTED
    job.rejection_reason = reason
    db.commit()
    db.refresh(job)

    return job


#to close jobs
def close_job(job_id, db):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")

    job.status = JobStatus.CLOSED
    db.commit()
    db.refresh(job)

    return job
