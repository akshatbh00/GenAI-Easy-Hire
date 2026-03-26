from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Enable pgvector extension on first connect
@event.listens_for(engine, "connect")
def connect(dbapi_conn, _):
    dbapi_conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
    dbapi_conn.commit()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()