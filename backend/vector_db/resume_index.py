"""
vector_db/resume_index.py — resume vector operations
Wraps pgvector queries so the rest of the app doesn't write raw SQL.
"""
from sqlalchemy.orm import Session
from sqlalchemy import text


def search_similar_resumes(
    query_embedding: list[float],
    db: Session,
    limit: int = 20,
    min_score: float = 0.5,
) -> list[dict]:
    rows = db.execute(text("""
        SELECT r.id, r.user_id, r.ats_score, r.parsed_data,
               u.full_name, u.email,
               1 - (r.embedding <=> :emb) AS similarity
        FROM resumes r
        JOIN users u ON u.id = r.user_id
        WHERE r.embedding IS NOT NULL
          AND r.is_active = true
          AND 1 - (r.embedding <=> :emb) >= :min_score
        ORDER BY r.embedding <=> :emb
        LIMIT :limit
    """), {
        "emb":       str(query_embedding),
        "limit":     limit,
        "min_score": min_score,
    }).fetchall()

    return [dict(r._mapping) for r in rows]


def upsert_resume_embedding(
    resume_id: str,
    embedding: list[float],
    db: Session,
):
    db.execute(text("""
        UPDATE resumes SET embedding = :emb WHERE id = :id
    """), {"emb": str(embedding), "id": resume_id})
    db.commit()