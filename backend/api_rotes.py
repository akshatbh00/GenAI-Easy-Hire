from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Resume
from storage.s3 import upload_file
from workers.resume_tasks import process_resume
import uuid

router = APIRouter(prefix="/resume", tags=["resume"])

ALLOWED_TYPES = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only PDF and DOCX are supported")

    # save to storage
    resume_id = str(uuid.uuid4())
    file_key  = f"resumes/{resume_id}/{file.filename}"
    content   = await file.read()
    upload_file(file_key, content)

    # create DB record
    resume = Resume(id=resume_id, file_path=file_key)
    db.add(resume)
    db.commit()

    # kick off async processing
    process_resume.delay(resume_id)

    return {"resume_id": resume_id, "status": "processing"}


@router.get("/{resume_id}/ats")
def get_ats_report(resume_id: str, db: Session = Depends(get_db)):
    r = db.query(Resume).filter(Resume.id == resume_id).first()
    if not r:
        raise HTTPException(404)
    return {"score": r.ats_score, "report": r.ats_report}


@router.get("/{resume_id}/parsed")
def get_parsed(resume_id: str, db: Session = Depends(get_db)):
    r = db.query(Resume).filter(Resume.id == resume_id).first()
    if not r:
        raise HTTPException(404)
    return r.parsed_data


@router.get("/{resume_id}/benchmark")
def get_benchmark(resume_id: str, job_title: str, db: Session = Depends(get_db)):
    from ai.benchmark.comparator import BenchmarkComparator
    return BenchmarkComparator().compare(resume_id, job_title, db)


@router.get("/{resume_id}/jobs")
def get_matched_jobs(
    resume_id: str,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    from ai.matching.job_matcher import JobMatcher
    return JobMatcher().match_jobs_for_resume(resume_id, db, limit)