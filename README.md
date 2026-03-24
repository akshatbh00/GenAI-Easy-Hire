hireflow/
│
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── frontend/                          # Next.js 14 App Router
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   │
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing page
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── onboarding/            # Job type selection + resume upload on first login
│   │   │       ├── page.tsx
│   │   │       ├── step-job-type.tsx
│   │   │       └── step-upload-resume.tsx
│   │   │
│   │   ├── (user)/                    # Job seeker portal
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx           # Main dashboard — score, pipeline status, suggestions
│   │   │   │   ├── pipeline-card.tsx  # "You are at Round 2 — HR Interview next"
│   │   │   │   ├── benchmark-card.tsx # Score vs selected candidates
│   │   │   │   └── ats-card.tsx       # ATS friendliness score
│   │   │   │
│   │   │   ├── resume/
│   │   │   │   ├── page.tsx           # Resume viewer + ATS analysis
│   │   │   │   ├── ats-report.tsx     # Keyword gaps, formatting issues
│   │   │   │   ├── optimizer.tsx      # Premium: exact rewrite suggestions
│   │   │   │   └── upload.tsx
│   │   │   │
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx           # Job listings (matched + all)
│   │   │   │   ├── [jobId]/page.tsx   # Job detail + apply
│   │   │   │   ├── applied/page.tsx   # All applications with stages
│   │   │   │   └── recommended.tsx    # AI-matched jobs widget
│   │   │   │
│   │   │   ├── applications/
│   │   │   │   ├── page.tsx           # All applications + current pipeline stage
│   │   │   │   └── [appId]/page.tsx   # Single application detail + timeline
│   │   │   │
│   │   │   └── profile/
│   │   │       ├── page.tsx
│   │   │       └── preferences.tsx
│   │   │
│   │   ├── (company)/                 # Recruiter / company portal
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx           # Active roles, pipeline health, top candidates
│   │   │   │   ├── funnel-chart.tsx   # Applicants → R1 → R2 → HR → Selected
│   │   │   │   └── stats-cards.tsx
│   │   │   │
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx           # All job postings
│   │   │   │   ├── create/page.tsx    # New job form
│   │   │   │   └── [jobId]/
│   │   │   │       ├── page.tsx       # Job detail + candidate list
│   │   │   │       └── pipeline/
│   │   │   │           ├── page.tsx   # Kanban pipeline view
│   │   │   │           └── stage-column.tsx
│   │   │   │
│   │   │   ├── candidates/
│   │   │   │   ├── page.tsx           # All candidates across roles
│   │   │   │   ├── [candidateId]/page.tsx
│   │   │   │   └── comparison.tsx     # Side-by-side compare
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       └── pipeline-stages.tsx  # Customize stages per role
│   │   │
│   │   └── (admin)/
│   │       └── dashboard/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                        # Shadcn + custom primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   └── ...
│   │   │
│   │   ├── dashboard/
│   │   │   ├── score-ring.tsx         # Circular score display
│   │   │   ├── stage-tracker.tsx      # Visual pipeline stage bar
│   │   │   ├── metric-card.tsx
│   │   │   └── activity-feed.tsx
│   │   │
│   │   ├── pipeline/
│   │   │   ├── kanban-board.tsx
│   │   │   ├── kanban-column.tsx
│   │   │   ├── candidate-card.tsx
│   │   │   └── stage-badge.tsx        # ATS Rejected / Round 1 / Selected badges
│   │   │
│   │   ├── resume/
│   │   │   ├── resume-viewer.tsx
│   │   │   ├── ats-score-display.tsx
│   │   │   ├── keyword-chips.tsx
│   │   │   └── improvement-list.tsx
│   │   │
│   │   └── jobs/
│   │       ├── job-card.tsx
│   │       ├── match-score-pill.tsx
│   │       └── filter-sidebar.tsx
│   │
│   ├── lib/
│   │   ├── api.ts                     # Axios/fetch wrappers
│   │   ├── auth.ts                    # NextAuth config
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   └── store/
│       ├── user.store.ts              # Zustand user state
│       ├── jobs.store.ts
│       └── pipeline.store.ts
│
│
├── backend/                           # Python FastAPI
│   ├── requirements.txt
│   ├── main.py                        # FastAPI app entry
│   ├── config.py                      # Settings, env vars
│   ├── database.py                    # SQLAlchemy engine + session
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py                  # Mounts all sub-routers
│   │   │
│   │   ├── auth/
│   │   │   ├── routes.py
│   │   │   ├── schemas.py
│   │   │   └── service.py
│   │   │
│   │   ├── users/
│   │   │   ├── routes.py
│   │   │   ├── schemas.py
│   │   │   └── service.py
│   │   │
│   │   ├── jobs/
│   │   │   ├── routes.py              # CRUD + search
│   │   │   ├── schemas.py
│   │   │   └── service.py
│   │   │
│   │   ├── applications/
│   │   │   ├── routes.py
│   │   │   ├── schemas.py
│   │   │   └── service.py
│   │   │
│   │   ├── pipeline/
│   │   │   ├── routes.py              # Move candidate between stages
│   │   │   ├── schemas.py
│   │   │   └── service.py
│   │   │
│   │   ├── resume/
│   │   │   ├── routes.py              # Upload, get analysis
│   │   │   ├── schemas.py
│   │   │   └── service.py
│   │   │
│   │   └── companies/
│   │       ├── routes.py
│   │       ├── schemas.py
│   │       └── service.py
│   │
│   │
│   ├── ai/                            ← CORE AI BRAIN
│   │   │
│   │   ├── resume/
│   │   │   ├── __init__.py
│   │   │   ├── ingestion.py           # PDF/DOCX → raw text (PyMuPDF, python-docx)
│   │   │   ├── loader.py              # Load from S3 / disk into memory
│   │   │   ├── chunker.py             # Section-aware chunking (Experience, Skills, etc.)
│   │   │   ├── embedder.py            # Chunk → vector embeddings (OpenAI/local)
│   │   │   ├── parser.py              # Extract structured fields (name, skills, exp years)
│   │   │   └── pipeline.py           # Orchestrates: load → ingest → chunk → embed → store
│   │   │
│   │   ├── ats/
│   │   │   ├── __init__.py
│   │   │   ├── scorer.py              # ATS score: keyword match, formatting, sections
│   │   │   ├── keyword_extractor.py   # Pull JD keywords vs resume keywords
│   │   │   ├── format_checker.py      # Font, columns, tables, special chars check
│   │   │   ├── section_validator.py   # Checks for required sections
│   │   │   └── report_generator.py    # Builds ATS report JSON
│   │   │
│   │   ├── matching/
│   │   │   ├── __init__.py
│   │   │   ├── job_matcher.py         # Resume → top N matching jobs
│   │   │   ├── candidate_ranker.py    # JD → top N matching candidates
│   │   │   └── score_calculator.py    # Weighted score: skills, experience, role-fit
│   │   │
│   │   ├── benchmark/
│   │   │   ├── __init__.py
│   │   │   ├── comparator.py          # Compare user resume vs selected-pool resumes
│   │   │   ├── gap_analyzer.py        # Identify missing skills/experience
│   │   │   └── improvement_suggester.py  # "Add these 3 skills to improve by 12 pts"
│   │   │
│   │   ├── retriever/
│   │   │   ├── __init__.py
│   │   │   ├── vector_retriever.py    # Semantic search in vector DB
│   │   │   ├── hybrid_retriever.py    # BM25 + vector hybrid
│   │   │   └── reranker.py            # Cross-encoder reranking
│   │   │
│   │   ├── optimizer/                 # PREMIUM feature
│   │   │   ├── __init__.py
│   │   │   ├── resume_rewriter.py     # LLM-powered section rewrite
│   │   │   ├── bullet_improver.py     # STAR-format bullet suggestions
│   │   │   └── jd_tailorer.py         # Rewrite resume for a specific JD
│   │   │
│   │   └── prompts/
│   │       ├── ats_analysis.txt
│   │       ├── resume_parse.txt
│   │       ├── benchmark_compare.txt
│   │       ├── job_match.txt
│   │       └── resume_optimize.txt
│   │
│   │
│   ├── models/                        # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── resume.py
│   │   ├── job.py
│   │   ├── application.py
│   │   ├── pipeline_stage.py
│   │   ├── company.py
│   │   ├── benchmark_score.py
│   │   └── subscription.py            # Free vs Premium tier
│   │
│   ├── workers/                       # Celery async tasks
│   │   ├── __init__.py
│   │   ├── celery_app.py
│   │   ├── resume_tasks.py            # Process resume after upload
│   │   ├── matching_tasks.py          # Background job matching
│   │   ├── benchmark_tasks.py         # Recalculate benchmarks
│   │   ├── notification_tasks.py      # Send emails/alerts
│   │   └── scraper_tasks.py           # Optional: LinkedIn/Naukri job scrape
│   │
│   ├── notifications/
│   │   ├── __init__.py
│   │   ├── email.py                   # SendGrid / SES
│   │   ├── in_app.py                  # WebSocket push
│   │   └── templates/
│   │       ├── stage_change.html
│   │       ├── new_match.html
│   │       └── selected.html
│   │
│   ├── storage/
│   │   ├── __init__.py
│   │   ├── s3.py                      # Upload/download from S3
│   │   └── local.py                   # Dev: local file storage
│   │
│   ├── scraper/                       # Optional external job ingestion
│   │   ├── __init__.py
│   │   ├── base_scraper.py
│   │   ├── linkedin_scraper.py        # LinkedIn jobs (optional/careful with ToS)
│   │   ├── naukri_scraper.py
│   │   └── normalizer.py              # Normalize scraped jobs to internal schema
│   │
│   └── migrations/                    # Alembic
│       ├── env.py
│       └── versions/
│
│
├── vector_db/
│   ├── __init__.py
│   ├── client.py                      # Pinecone / pgvector connection
│   ├── resume_index.py                # Resume vector operations
│   ├── job_index.py                   # Job description vector operations
│   └── selected_pool_index.py        # Index of selected candidate resumes
│
│
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.frontend
│   │   ├── Dockerfile.backend
│   │   └── Dockerfile.worker
│   ├── nginx/
│   │   └── nginx.conf
│   └── scripts/
│       ├── seed_db.py
│       └── migrate.sh
│
│
└── tests/
    ├── backend/
    │   ├── test_ats_scorer.py
    │   ├── test_resume_parser.py
    │   ├── test_job_matcher.py
    │   ├── test_pipeline.py
    │   └── test_benchmark.py
    └── frontend/
        └── components/