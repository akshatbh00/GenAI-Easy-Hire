"""
backend/api/jobs/routes.py
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from api.auth.routes import get_current_user, require_recruiter
from api.jobs import service
from api.jobs.schemas import JobCreateRequest, JobUpdateRequest, JobOut

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("", response_model=list[JobOut])
def list_jobs(
    job_type:  str  = Query(None),
    location:  str  = Query(None),
    remote_ok: bool = Query(None),
    search:    str  = Query(None),
    skip:      int  = Query(0),
    limit:     int  = Query(20, le=50),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),   # must be logged in
):
    jobs = service.list_jobs(db, job_type, location, remote_ok, search, skip, limit)
    return [
        JobOut(
            **{c.name: getattr(j, c.name) for c in j.__table__.columns},
            company_name=j.company.name if j.company else None,
        )
        for j in jobs
    ]


@router.get("/{job_id}", response_model=JobOut)
def get_job(
    job_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    j = service.get_job(job_id, db)
    return JobOut(
        **{c.name: getattr(j, c.name) for c in j.__table__.columns},
        company_name=j.company.name if j.company else None,
    )


@router.post("", response_model=JobOut, status_code=201)
def create_job(
    payload: JobCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_recruiter),
):
    j = service.create_job(payload, current_user.id, db)
    return JobOut(
        **{c.name: getattr(j, c.name) for c in j.__table__.columns},
        company_name=j.company.name if j.company else None,
    )


@router.patch("/{job_id}", response_model=JobOut)
def update_job(
    job_id: UUID,
    payload: JobUpdateRequest,
    db: Session = Depends(get_db),
    _=Depends(require_recruiter),
):
    j = service.update_job(job_id, payload, db)
    return JobOut(
        **{c.name: getattr(j, c.name) for c in j.__table__.columns},
        company_name=j.company.name if j.company else None,
    )


@router.delete("/{job_id}", status_code=204)
def delete_job(
    job_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_recruiter),
):
    service.delete_job(job_id, db)


@router.get("/{job_id}/candidates")
def get_candidates_for_job(
    job_id: UUID,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    _=Depends(require_recruiter),
):
    """AI-ranked candidate list for a job posting."""
    from ai.matching.job_matcher import JobMatcher
    return JobMatcher().rank_candidates_for_job(str(job_id), db, limit)



#% job match
@router.get("/{job_id}/match")
def get_match_breakdown(
    job_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    % match breakdown for a job BEFORE applying.
    Shows skills, experience, location match separately.
    """
    return service.get_match_breakdown(job_id, str(current_user.id), db)