"""
backend/api/companies/routes.py
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from api.auth.routes import get_current_user, require_recruiter, require_admin
from api.companies import service
from api.companies.schemas import (
    CompanyCreateRequest, CompanyUpdateRequest,
    CompanyOut, RecruiterInviteRequest,
)

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.post("", response_model=CompanyOut, status_code=201)
def create_company(
    payload: CompanyCreateRequest,
    db: Session = Depends(get_db),
    _=Depends(require_admin),          # only admin can create companies for now
):
    return service.create_company(payload, db)


@router.get("/me", response_model=CompanyOut)
def my_company(
    db: Session = Depends(get_db),
    current_user=Depends(require_recruiter),
):
    """Returns the company this recruiter belongs to."""
    return service.get_company_by_recruiter(current_user.id, db)


@router.get("/me/stats")
def my_company_stats(
    db: Session = Depends(get_db),
    current_user=Depends(require_recruiter),
):
    """Recruiter dashboard stats — active jobs, applicants, pipeline breakdown."""
    company = service.get_company_by_recruiter(current_user.id, db)
    return service.get_company_stats(company.id, db)


@router.patch("/{company_id}", response_model=CompanyOut)
def update_company(
    company_id: UUID,
    payload: CompanyUpdateRequest,
    db: Session = Depends(get_db),
    _=Depends(require_recruiter),
):
    return service.update_company(company_id, payload, db)


@router.get("/{company_id}", response_model=CompanyOut)
def get_company(
    company_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return service.get_company(company_id, db)


@router.post("/{company_id}/invite")
def invite_recruiter(
    company_id: UUID,
    payload: RecruiterInviteRequest,
    db: Session = Depends(get_db),
    _=Depends(require_recruiter),
):
    """Invite an existing user to join as recruiter."""
    service.invite_recruiter(company_id, payload.email, db)
    return {"message": "Recruiter invited successfully"}