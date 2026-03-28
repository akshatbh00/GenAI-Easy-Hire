"""
vector_db/selected_pool_index.py — selected candidate pool vector operations
Used by BenchmarkComparator to find similar hired candidates.
"""
from sqlalchemy.orm import Session
from sqlalchemy import text


def search_pool_by_job_title(
    query_embedding: list[float],
    job_title: str,
    db: Session,
    limit: int = 50,
) -> list[dict]:
    rows = db.execute(text("""
        SELECT sp.id, sp.resume_id, sp.job_title,
               1 - (sp.embedding <=> :emb) AS similarity
        FROM selected_pool sp
        WHERE sp.embedding IS NOT NULL
          AND sp.job_title ILIKE :title
        ORDER BY sp.embedding <=> :emb
        LIMIT :limit
    """), {
        "emb":   str(query_embedding),
        "title": f"%{job_title}%",
        "limit": limit,
    }).fetchall()

    return [dict(r._mapping) for r in rows]


def add_to_pool(
    resume_id: str,
    job_id: str,
    job_title: str,
    embedding: list[float],
    db: Session,
):
    """Called by PipelineService when a candidate is moved to SELECTED."""
    from models import SelectedPoolEntry
    import uuid
    existing = db.query(SelectedPoolEntry).filter(
        SelectedPoolEntry.resume_id == resume_id,
        SelectedPoolEntry.job_id    == job_id,
    ).first()
    if not existing:
        db.add(SelectedPoolEntry(
            id=uuid.uuid4(),
            resume_id=resume_id,
            job_id=job_id,
            job_title=job_title,
            embedding=embedding,
        ))
        db.commit()
```

---

### Prompt files — `backend/ai/prompts/`

**`ats_analysis.txt`**
```
Rate this resume for ATS compatibility. Score each area and list the top issues.
Focus on: keyword density, section completeness, formatting clarity, length.
Return JSON only with fields: keyword_density (0-35), clarity_score (0-10), issues (list of strings).
```

**`resume_parse.txt`**
```
Extract structured data from the resume below.
Return only valid JSON with fields: name, email, phone, location,
total_experience_years, current_title, skills, education, experience, certifications.
Do not add commentary. If a field is missing return null.
```

**`benchmark_compare.txt`**
```
Compare the candidate profile against the selected pool.
Identify skill gaps, experience gaps, and title misalignment.
Be specific and actionable. Return JSON only.
```

**`job_match.txt`**
```
Given this resume and job description, score the match from 0-100.
Consider: skills overlap, experience level, role alignment, location.
Return JSON: { "score": int, "reasons": [str], "missing": [str] }
```

**`resume_optimize.txt`**
```
Rewrite the provided resume section to better target the job description.
Rules: keep it truthful, use action verbs, quantify achievements,
mirror JD keywords naturally, maintain approximate length.
Return only the rewritten text.