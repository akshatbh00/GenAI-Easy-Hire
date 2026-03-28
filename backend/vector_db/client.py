"""
vector_db/client.py — unified vector DB client
Supports pgvector (default/dev) and Pinecone (prod).
Switch via VECTOR_BACKEND in .env
"""
from config import settings


def get_vector_client():
    if settings.VECTOR_BACKEND == "pinecone":
        return _get_pinecone()
    return None   # pgvector uses SQLAlchemy directly — no separate client needed


def _get_pinecone():
    try:
        from pinecone import Pinecone
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        return pc.Index(settings.PINECONE_INDEX)
    except ImportError:
        raise RuntimeError("pinecone-client not installed. pip install pinecone-client")