from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime,
    ForeignKey, Text, JSON, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from database import Base

try:
    from sqlalchemy.dialects.postgresql import UUID
    from pgvector.sqlalchemy import Vector
    USE_PG = True
except ImportError:
    from sqlalchemy import String as UUID
    Vector = lambda x: Text
    USE_PG = False


def uuid_pk():
    return Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

def now():
    return Column(DateTime, default=datetime.utcnow)


# ── Enums ──────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    JOBSEEKER = "jobseeker"
    RECRUITER = "recruiter"
    ADMIN     = "admin"

class PipelineStage(str, enum.Enum):
    APPLIED        = "applied"
    ATS_SCREENING  = "ats_screening"
    ATS_REJECTED   = "ats_rejected"
    ROUND_1        = "round_1"
    ROUND_2        = "round_2"
    ROUND_3        = "round_3"
    HR_ROUND       = "hr_round"
    OFFER          = "offer"
    SELECTED       = "selected"
    WITHDRAWN      = "withdrawn"

class JobType(str, enum.Enum):
    FULLTIME   = "fulltime"
    PARTTIME   = "parttime"
    CONTRACT   = "contract"
    INTERNSHIP = "internship"
    REMOTE     = "remote"

class SubscriptionTier(str, enum.Enum):
    FREE    = "free"
    PREMIUM = "premium"

class JobStatus(str, enum.Enum):
    DRAFT            = "draft"
    PENDING_APPROVAL = "pending_approval"
    LIVE             = "live"
    CLOSED           = "closed"
    REJECTED         = "rejected"


# ── Models ─────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"
    id         = uuid_pk()
    email      = Column(String, unique=True, nullable=False, index=True)
    hashed_pw  = Column(String, nullable=False)
    full_name  = Column(String)
    role       = Column(SAEnum(UserRole), default=UserRole.JOBSEEKER)
    tier       = Column(SAEnum(SubscriptionTier), default=SubscriptionTier.FREE)
    job_pref   = Column(JSON)
    is_active  = Column(Boolean, default=True)
    created_at = now()

    resumes      = relationship("Resume", back_populates="user")
    applications = relationship("Application", back_populates="user")


class Company(Base):
    __tablename__ = "companies"
    id          = uuid_pk()
    name        = Column(String, nullable=False)
    slug        = Column(String, unique=True)
    logo_url    = Column(String)
    website     = Column(String)
    description = Column(Text)
    created_at  = now()

    jobs       = relationship("Job", back_populates="company")
    recruiters = relationship("Recruiter", back_populates="company")


class Recruiter(Base):
    __tablename__ = "recruiters"
    id         = uuid_pk()
    user_id    = Column(String(36), ForeignKey("users.id"))
    company_id = Column(String(36), ForeignKey("companies.id"))
    company    = relationship("Company", back_populates="recruiters")


class Resume(Base):
    __tablename__ = "resumes"
    id          = uuid_pk()
    user_id     = Column(String(36), ForeignKey("users.id"))
    file_path   = Column(String)
    raw_text    = Column(Text)
    parsed_data = Column(JSON)
    ats_score   = Column(Float)
    ats_report  = Column(JSON)
    embedding   = Column(Text)
    is_active   = Column(Boolean, default=True)
    created_at  = now()

    user   = relationship("User", back_populates="resumes")
    chunks = relationship("ResumeChunk", back_populates="resume")


class ResumeChunk(Base):
    __tablename__ = "resume_chunks"
    id          = uuid_pk()
    resume_id   = Column(String(36), ForeignKey("resumes.id"))
    section     = Column(String)
    content     = Column(Text)
    embedding   = Column(Text)
    chunk_index = Column(Integer)

    resume = relationship("Resume", back_populates="chunks")


class Job(Base):
    __tablename__ = "jobs"
    id               = uuid_pk()
    company_id       = Column(String(36), ForeignKey("companies.id"))
    title            = Column(String, nullable=False)
    description      = Column(Text)
    requirements     = Column(JSON)
    job_type         = Column(SAEnum(JobType))
    location         = Column(String)
    remote_ok        = Column(Boolean, default=False)
    salary_min       = Column(Integer)
    salary_max       = Column(Integer)
    embedding        = Column(Text)
    is_active        = Column(Boolean, default=False)
    source           = Column(String, default="internal")
    source_url       = Column(String)
    status           = Column(SAEnum(JobStatus), default=JobStatus.PENDING_APPROVAL)
    budget_approved  = Column(Boolean, default=False)
    headcount        = Column(Integer, nullable=True)
    approved_by      = Column(String(36), ForeignKey("users.id"), nullable=True)
    approved_at      = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at       = now()

    company      = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job")


class Application(Base):
    __tablename__ = "applications"
    id              = uuid_pk()
    user_id         = Column(String(36), ForeignKey("users.id"))
    job_id          = Column(String(36), ForeignKey("jobs.id"))
    resume_id       = Column(String(36), ForeignKey("resumes.id"))
    current_stage   = Column(SAEnum(PipelineStage), default=PipelineStage.APPLIED)
    highest_stage   = Column(SAEnum(PipelineStage), default=PipelineStage.APPLIED)
    match_score     = Column(Float)
    benchmark_score = Column(Float)
    ats_passed      = Column(Boolean)
    notes           = Column(Text)
    created_at      = now()
    updated_at      = Column(DateTime, onupdate=datetime.utcnow)

    user          = relationship("User", back_populates="applications")
    job           = relationship("Job", back_populates="applications")
    stage_history = relationship("StageHistory", back_populates="application")


class StageHistory(Base):
    __tablename__ = "stage_history"
    id             = uuid_pk()
    application_id = Column(String(36), ForeignKey("applications.id"))
    from_stage     = Column(SAEnum(PipelineStage))
    to_stage       = Column(SAEnum(PipelineStage))
    moved_by       = Column(String(36), ForeignKey("users.id"))
    notes          = Column(Text)
    created_at     = now()

    application = relationship("Application", back_populates="stage_history")


class SelectedPoolEntry(Base):
    __tablename__ = "selected_pool"
    id         = uuid_pk()
    resume_id  = Column(String(36), ForeignKey("resumes.id"))
    job_id     = Column(String(36), ForeignKey("jobs.id"))
    job_title  = Column(String)
    embedding  = Column(Text)
    created_at = now()


class Subscription(Base):
    __tablename__ = "subscriptions"
    id          = uuid_pk()
    user_id     = Column(String(36), ForeignKey("users.id"))
    tier        = Column(SAEnum(SubscriptionTier))
    payment_id  = Column(String)
    valid_until = Column(DateTime)
    created_at  = now()


class InAppNotification(Base):
    __tablename__ = "notifications"
    id             = uuid_pk()
    user_id        = Column(String(36), ForeignKey("users.id"))
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=True)
    stage          = Column(String)
    message        = Column(Text)
    is_read        = Column(Boolean, default=False)
    created_at     = now()


class Referral(Base):
    __tablename__ = "referrals"
    id             = uuid_pk()
    referrer_id    = Column(String(36), ForeignKey("users.id"))
    referred_id    = Column(String(36), ForeignKey("users.id"), nullable=True)
    referral_code  = Column(String(20), unique=True, index=True)
    job_id         = Column(String(36), ForeignKey("jobs.id"), nullable=True)
    status         = Column(String, default="pending")
    reward_granted = Column(Boolean, default=False)
    created_at     = now()
    updated_at     = Column(DateTime, onupdate=datetime.utcnow)


class UserWorkHistory(Base):
    __tablename__ = "user_work_history"
    id               = uuid_pk()
    user_id          = Column(String(36), ForeignKey("users.id"))
    company_name     = Column(String, nullable=False)
    is_current       = Column(Boolean, default=True)
    is_open_to_refer = Column(Boolean, default=True)
    network_visible  = Column(Boolean, default=True)
    created_at       = now()


class InsiderReferralRequest(Base):
    __tablename__ = "insider_referral_requests"
    id             = uuid_pk()
    requester_id   = Column(String(36), ForeignKey("users.id"))
    insider_id     = Column(String(36), ForeignKey("users.id"))
    job_id         = Column(String(36), ForeignKey("jobs.id"))
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=True)
    status         = Column(String, default="pending")
    message        = Column(Text, nullable=True)
    boost_applied  = Column(Boolean, default=False)
    created_at     = now()
    updated_at     = Column(DateTime, onupdate=datetime.utcnow)


class InsiderReferralMonthlyLimit(Base):
    __tablename__ = "insider_referral_limits"
    id          = uuid_pk()
    insider_id  = Column(String(36), ForeignKey("users.id"))
    month       = Column(String(7))
    count       = Column(Integer, default=0)
    created_at  = now()


class KarenMemory(Base):
    __tablename__ = "karen_memory"
    id             = uuid_pk()
    user_id        = Column(String(36), ForeignKey("users.id"), unique=True)
    messages       = Column(JSON, default=list)
    summary        = Column(Text, nullable=True)
    total_messages = Column(Integer, default=0)
    created_at     = now()
    updated_at     = Column(DateTime, onupdate=datetime.utcnow)


class RoundClearerEntry(Base):
    __tablename__ = "round_clearers"
    id            = uuid_pk()
    resume_id     = Column(String(36), ForeignKey("resumes.id"))
    job_id        = Column(String(36), ForeignKey("jobs.id"))
    job_title     = Column(String)
    round_cleared = Column(String)
    embedding     = Column(Text)
    created_at    = now()

class SalaryInsight(Base):
    """
    Aggregated salary data by role + city + experience.
    Populated from job postings automatically.
    """
    __tablename__ = "salary_insights"
    id              = uuid_pk()
    job_title       = Column(String, nullable=False, index=True)
    location        = Column(String, nullable=False, index=True)
    experience_min  = Column(Integer, default=0)
    experience_max  = Column(Integer, default=50)
    salary_min      = Column(Integer)
    salary_max      = Column(Integer)
    salary_avg      = Column(Integer)
    sample_size     = Column(Integer, default=1)
    source          = Column(String, default="internal")  # internal/glassdoor/etc
    created_at      = now()
    updated_at      = Column(DateTime, onupdate=datetime.utcnow)