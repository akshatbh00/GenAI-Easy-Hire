"""
backend/api/users/routes.py
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from api.auth.routes import get_current_user
from api.users import service
from api.users.schemas import UserUpdateRequest

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Single call that returns everything for the job seeker dashboard.
    Frontend hits this once on load.
    """
    return service.get_dashboard(current_user.id, db)


@router.patch("/me")
def update_profile(
    payload: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return service.update_profile(
        current_user.id,
        full_name=payload.full_name,
        job_pref=payload.job_pref,
        db=db,
    )


@router.post("/notifications/read")
def mark_read(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Mark all unread notifications as read."""
    service.mark_notifications_read(current_user.id, db)
    return {"message": "Notifications marked as read"}


#% profile completeness
@router.get("/profile/completeness")
def profile_completeness(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Profile completeness score with actionable nudges."""
    return service.get_profile_completeness(str(current_user.id), db)
