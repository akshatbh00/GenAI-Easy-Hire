"use client";

import { useEffect, useState } from "react";
import { jobsApi, resumeApi, applicationsApi, JobOut } from "@/lib/api";
import { useUserStore } from "@/store/user.store";
import Link from "next/link";

const JOB_TYPES = ["", "fulltime", "parttime", "contract", "internship", "remote"];

export default function JobsPage() {
  const { user }            = useUserStore();
  const [jobs, setJobs]     = useState<JobOut[]>([]);
  const [loading, setLoading]   = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied]   = useState<Set<string>>(new Set());

  const [search,   setSearch]   = useState("");
  const [jobType,  setJobType]  = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => { loadJobs(); }, [search, jobType, location]);

  async function loadJobs() {
    setLoading(true);
    try {
      const res = await jobsApi.list({
        search:   search   || undefined,
        job_type: jobType  || undefined,
        location: location || undefined,
        limit: 50,
      });
      setJobs(res);
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(jobId: string) {
    setApplying(jobId);
    try {
      await applicationsApi.apply(jobId);
      setApplied((s) => new Set([...s, jobId]));
    } catch (e: any) {
      if (e.message?.includes("Already applied")) {
        setApplied((s) => new Set([...s, jobId]));
      }
    } finally {
      setApplying(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]"
         style={{ fontFamily: "'DM Mono', monospace" }}>

      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10">
        <Link href="/dashboard"
              className="text-white font-bold tracking-[0.2em] uppercase text-sm">
          Hire<span className="text-[#00ff87]">Flow</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard"    className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">Dashboard</Link>
          <Link href="/applications" className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">Applications</Link>
          <Link href="/resume"       className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">Resume</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold tracking-tight">Job Board</h1>
          <p className="text-[#444] text-sm mt-1">
            {jobs.length} roles · AI-ranked for your profile
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles..."
            className="bg-[#0f0f0f] border border-[#1e1e1e] text-white text-sm px-4 py-2.5 rounded-sm outline-none focus:border-[#00ff87] placeholder:text-[#333] w-64 transition-colors"
          />
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="bg-[#0f0f0f] border border-[#1e1e1e] text-[#888] text-sm px-4 py-2.5 rounded-sm outline-none focus:border-[#00ff87] transition-colors"
          >
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>{t ? t.charAt(0).toUpperCase() + t.slice(1) : "All Types"}</option>
            ))}
          </select>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location..."
            className="bg-[#0f0f0f] border border-[#1e1e1e] text-white text-sm px-4 py-2.5 rounded-sm outline-none focus:border-[#00ff87] placeholder:text-[#333] w-40 transition-colors"
          />
        </div>

        {/* Job grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-[#1a1a1a] bg-[#0f0f0f] rounded-sm p-5 animate-pulse h-32" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#333] text-sm">No jobs found matching your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isApplied={applied.has(job.id)}
                isApplying={applying === job.id}
                onApply={() => handleApply(job.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


function JobCard({
  job, isApplied, isApplying, onApply,
}: {
  job: JobOut;
  isApplied: boolean;
  isApplying: boolean;
  onApply: () => void;
}) {
  return (
    <div className="border border-[#1e1e1e] bg-[#0f0f0f] rounded-sm p-5 hover:border-[#2a2a2a] transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link href={`/jobs/${job.id}`}>
            <h3 className="text-white text-sm font-medium group-hover:text-[#00ff87] transition-colors truncate">
              {job.title}
            </h3>
          </Link>
          <p className="text-[#555] text-xs mt-0.5">{job.company_name}</p>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="px-2 py-0.5 border border-[#222] text-[#555] text-xs rounded-sm uppercase tracking-wider">
              {job.job_type}
            </span>
            {job.location && (
              <span className="text-[#444] text-xs">{job.location}</span>
            )}
            {job.remote_ok && (
              <span className="text-[#00ff87] text-xs">Remote OK</span>
            )}
            {job.salary_min && (
              <span className="text-[#444] text-xs">
                ₹{(job.salary_min / 100000).toFixed(1)}L
                {job.salary_max ? `–${(job.salary_max / 100000).toFixed(1)}L` : "+"}
              </span>
            )}
          </div>
        </div>

        {/* Match score + apply */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          {job.match_score && (
            <span className="text-[#00ff87] text-xs font-bold">
              {Math.round(job.match_score)}%
            </span>
          )}
          <button
            onClick={onApply}
            disabled={isApplied || isApplying}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-sm transition-all ${
              isApplied
                ? "bg-transparent border border-[#00ff87]/30 text-[#00ff87]/50 cursor-default"
                : "bg-[#00ff87] text-black hover:bg-[#00e87a]"
            } disabled:cursor-not-allowed`}
          >
            {isApplied ? "Applied ✓" : isApplying ? "..." : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

**Folder summary:**
```
frontend/
├── app/(user)/
│   ├── dashboard/page.tsx     ✅ full dashboard
│   └── jobs/page.tsx          ✅ job board + apply
└── components/
    ├── dashboard/
    │   ├── score-ring.tsx     ✅ animated SVG ring
    │   ├── stage-tracker.tsx  ✅ pipeline progress bar
    │   ├── metric-card.tsx    ✅ stat cards
    │   └── activity-feed.tsx  ✅ notifications feed
    └── resume/
        └── ats-score-display.tsx ✅ ATS breakdown