from fastapi import APIRouter
from api.auth.routes import router as auth_router
from api.resume.routes import router as resume_router
from api.pipeline.routes import router as pipeline_router
from api.jobs.routes import router as jobs_router
from api.applications.routes import router as applications_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(resume_router)
api_router.include_router(pipeline_router)
api_router.include_router(jobs_router)
api_router.include_router(applications_router)
```

---

**Folder summary for this batch:**
```
backend/
├── workers/
│   ├── resume_tasks.py          ← new
│   └── notification_tasks.py   ← new
├── api/
│   ├── jobs/
│   │   ├── routes.py            ← new
│   │   ├── service.py           ← new
│   │   └── schemas.py           ← new
│   ├── applications/
│   │   ├── routes.py            ← new
│   │   ├── service.py           ← new
│   │   └── schemas.py           ← new
│   └── router.py                ← updated



#added to be chacked and updated

from fastapi import APIRouter
from api.auth.routes import router as auth_router
from api.resume.routes import router as resume_router
from api.pipeline.routes import router as pipeline_router
from api.jobs.routes import router as jobs_router
from api.applications.routes import router as applications_router
from api.companies.routes import router as companies_router
from api.users.routes import router as users_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(resume_router)
api_router.include_router(pipeline_router)
api_router.include_router(jobs_router)
api_router.include_router(applications_router)
api_router.include_router(companies_router)
api_router.include_router(users_router)
```

---

**Backend is now ~90% complete.** Here's where we stand:
```
✅ Auth (register, login, JWT, onboarding)
✅ Resume (upload, ATS, benchmark, job matches)
✅ Pipeline (stage moves, audit trail, kanban)
✅ Jobs (CRUD, AI candidate ranking)
✅ Applications (apply, history, withdraw)
✅ Companies (create, stats, recruiter invite)
✅ Users (dashboard aggregation, notifications)
✅ Workers(resume processing, notifications, benchmark cron)



#added at 100% of the backend

from fastapi import APIRouter
from api.auth.routes import router as auth_router
from api.resume.routes import router as resume_router
from api.pipeline.routes import router as pipeline_router
from api.jobs.routes import router as jobs_router
from api.applications.routes import router as applications_router
from api.companies.routes import router as companies_router
from api.users.routes import router as users_router
from api.premium.routes import router as premium_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(resume_router)
api_router.include_router(pipeline_router)
api_router.include_router(jobs_router)
api_router.include_router(applications_router)
api_router.include_router(companies_router)
api_router.include_router(users_router)
api_router.include_router(premium_router)
```

---

**Backend is 100% complete.** Full picture:
```
✅ Auth + JWT
✅ Resume pipeline (ingest → parse → chunk → embed → ATS)
✅ Job matching (semantic + weighted scoring)
✅ Pipeline stages (kanban, audit trail, transparency)
✅ Applications (apply, history, withdraw)
✅ Companies + recruiter portal
✅ User dashboard (single aggregated endpoint)
✅ Workers (Celery: resume, notifications, benchmark cron)
✅ Premium optimizer (rewrite, bullets, summary, gap analysis)
✅ Vector DB layer (pgvector + Pinecone ready)
✅ Prompt files