"""
vector_db/job_index.py — job description vector operations
"""
from sqlalchemy.orm import Session
from sqlalchemy import text


def search_similar_jobs(
    query_embedding: list[float],
    db: Session,
    limit: int = 20,
    filters: dict = None,
) -> list[dict]:
    """
    Find jobs semantically similar to a query embedding (resume or search query).
    filters: {"job_type": str, "location": str, "remote_ok": bool}
    """
    where = "WHERE j.embedding IS NOT NULL AND j.is_active = true"
    params = {"emb": str(query_embedding), "limit": limit}

    if filters:
        if filters.get("job_type"):
            where += " AND j.job_type = :job_type"
            params["job_type"] = filters["job_type"]
        if filters.get("location"):
            where += " AND (j.remote_ok = true OR j.location ILIKE :location)"
            params["location"] = f"%{filters['location']}%"
        if filters.get("remote_ok"):
            where += " AND j.remote_ok = true"

    rows = db.execute(text(f"""
        SELECT j.id, j.title, j.location, j.job_type,
               j.salary_min, j.salary_max, j.remote_ok,
               c.name as company_name, c.logo_url,
               1 - (j.embedding <=> :emb) AS score
        FROM jobs j
        JOIN companies c ON c.id = j.company_id
        {where}
        ORDER BY j.embedding <=> :emb
        LIMIT :limit
    """), params).fetchall()

    return [dict(r._mapping) for r in rows]


def upsert_job_embedding(job_id: str, embedding: list[float], db: Session):
    db.execute(text("""
        UPDATE jobs SET embedding = :emb WHERE id = :id
    """), {"emb": str(embedding), "id": job_id})
    db.commit()