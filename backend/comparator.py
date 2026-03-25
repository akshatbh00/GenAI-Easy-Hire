"""
job_matcher.py — semantic + weighted matching
resume → top N jobs  |  JD → top N candidates
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from models import Resume, Job, Application
from ai.resume.embedder import ResumeEmbedder

embedder = ResumeEmbedder()


class JobMatcher:

    def match_jobs_for_resume(
        self,
        resume_id: str,
        db: Session,
        limit: int = 20,
        job_type: str = None,
        location: str = None,
    ) -> list[dict]:
        """Find best jobs for a given resume using cosine similarity on pgvector."""
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume or resume.embedding is None:
            return []

        filters = "AND j.is_active = true"
        if job_type:   filters += f" AND j.job_type = '{job_type}'"
        if location:   filters += f" AND (j.remote_ok = true OR j.location ILIKE '%{location}%')"

        rows = db.execute(text(f"""
            SELECT j.id, j.title, j.location, j.job_type, j.salary_min, j.salary_max,
                   j.remote_ok, c.name as company_name, c.logo_url,
                   1 - (j.embedding <=> :emb) AS score
            FROM jobs j
            JOIN companies c ON c.id = j.company_id
            WHERE j.embedding IS NOT NULL {filters}
            ORDER BY j.embedding <=> :emb
            LIMIT :limit
        """), {"emb": str(resume.embedding), "limit": limit}).fetchall()

        return [dict(r._mapping) for r in rows]

    def rank_candidates_for_job(
        self,
        job_id: str,
        db: Session,
        limit: int = 50,
    ) -> list[dict]:
        """Find best candidates for a job posting."""
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job or job.embedding is None:
            return []

        rows = db.execute(text("""
            SELECT r.id as resume_id, r.user_id, r.ats_score, r.parsed_data,
                   u.full_name, u.email,
                   1 - (r.embedding <=> :emb) AS match_score
            FROM resumes r
            JOIN users u ON u.id = r.user_id
            WHERE r.embedding IS NOT NULL AND r.is_active = true
            ORDER BY r.embedding <=> :emb
            LIMIT :limit
        """), {"emb": str(job.embedding), "limit": limit}).fetchall()

        return [dict(r._mapping) for r in rows]


class ScoreCalculator:
    """Weighted final score: semantic match + ATS + experience fit"""

    WEIGHTS = {"semantic": 0.55, "ats": 0.25, "experience": 0.20}

    def calculate(
        self,
        semantic_score: float,   # 0-1 cosine similarity
        ats_score: float,        # 0-100
        required_exp: int,       # years required by JD
        candidate_exp: float,    # years from parsed resume
    ) -> float:
        ats_norm = ats_score / 100
        exp_fit  = min(candidate_exp / max(required_exp, 1), 1.0) if required_exp else 0.8
        score = (
            semantic_score * self.WEIGHTS["semantic"] +
            ats_norm       * self.WEIGHTS["ats"] +
            exp_fit        * self.WEIGHTS["experience"]
        )
        return round(score * 100, 1)