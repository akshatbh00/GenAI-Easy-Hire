"use client";

import { useEffect, useState } from "react";
import { companyApi, pipelineApi, jobsApi, CompanyStats } from "@/lib/api";
import { useUserStore } from "@/store/user.store";
import { useRouter } from "next/navigation";
import MetricCard from "@/components/dashboard/metric-card";
import Link from "next/link";

const STAGE_ORDER = [
  "applied","ats_screening","round_1",
  "round_2","round_3","hr_round","offer","selected","ats_rejected",
];

const STAGE_COLORS: Record<string, string> = {
  selected:     "#00ff87",
  offer:        "#00ff87",
  hr_round:     "#60a5fa",
  round_1:      "#60a5fa",
  round_2:      "#60a5fa",
  round_3:      "#60a5fa",
  ats_rejected: "#ef4444",
  applied:      "#555",
  ats_screening:"#f59e0b",
};

export default function CompanyDashboardPage() {
  const router          = useRouter();
  const { user, logout} = useUserStore();
  const [stats, setStats]   = useState<CompanyStats | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "jobseeker") { router.push("/dashboard"); return; }
    Promise.all([
      companyApi.me(),
      companyApi.stats(),
      jobsApi.list({ limit: 10 }),
    ])
      .then(([c, s, j]) => { setCompany(c); setStats(s); setJobs(j); })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;
  if (!stats)  return null;

  const breakdown = stats.pipeline_breakdown ?? {};
  const maxCount  = Math.max(...Object.values(breakdown), 1);

  return (
    <div className="min-h-screen bg-[#0a0a0a]"
         style={{ fontFamily: "'DM Mono', monospace" }}>

      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold tracking-[0.2em] uppercase text-sm">
            Hire<span className="text-[#00ff87]">Flow</span>
          </span>
          {company && (
            <>
              <span className="text-[#2a2a2a]">/</span>
              <span className="text-[#555] text-xs uppercase tracking-widest">
                {company.name}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-6">
          <Link href="/company/jobs"
                className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">
            Jobs
          </Link>
          <Link href="/company/candidates"
                className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">
            Candidates
          </Link>
          <Link href="/company/settings"
                className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">
            Settings
          </Link>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="text-[#333] text-xs uppercase tracking-widest hover:text-[#888] transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">
              Recruiter Dashboard
            </h1>
            <p className="text-[#444] text-sm mt-1">
              {company?.name ?? "Your Company"}
            </p>
          </div>
          <Link
            href="/company/jobs/create"
            className="px-5 py-2.5 bg-[#00ff87] text-black text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#00e87a] transition-colors"
          >
            + Post Job
          </Link>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="Active Jobs"
            value={stats.active_jobs}
            sub="Open roles"
            accent
          />
          <MetricCard
            label="Total Applicants"
            value={stats.total_applicants}
            sub="Across all roles"
          />
          <MetricCard
            label="In Pipeline"
            value={
              Object.entries(breakdown)
                .filter(([s]) => !["applied","ats_rejected","withdrawn"].includes(s))
                .reduce((a, [, v]) => a + v, 0)
            }
            sub="Active candidates"
          />
          <MetricCard
            label="Selected"
            value={breakdown["selected"] ?? 0}
            sub="Hired this cycle"
            accent={!!(breakdown["selected"])}
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Funnel chart */}
          <div className="lg:col-span-2 border border-[#1e1e1e] bg-[#0f0f0f] rounded-sm p-6">
            <h2 className="text-[#888] text-xs uppercase tracking-widest mb-6">
              Pipeline Funnel
            </h2>
            <div className="space-y-3">
              {STAGE_ORDER.filter((s) => breakdown[s] != null).map((stage) => {
                const count = breakdown[stage] ?? 0;
                const pct   = (count / maxCount) * 100;
                const color = STAGE_COLORS[stage] ?? "#555";

                return (
                  <div key={stage} className="flex items-center gap-4">
                    <span className="text-[#444] text-xs uppercase tracking-wider w-28 flex-shrink-0">
                      {stage.replace(/_/g, " ")}
                    </span>
                    <div className="flex-1 h-5 bg-[#141414] rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-700 flex items-center px-2"
                        style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: color + "33", borderLeft: `2px solid ${color}` }}
                      />
                    </div>
                    <span className="text-white text-xs font-bold w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active jobs list */}
          <div className="border border-[#1e1e1e] bg-[#0f0f0f] rounded-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#888] text-xs uppercase tracking-widest">Active Roles</h2>
              <Link href="/company/jobs"
                    className="text-[#333] text-xs hover:text-[#00ff87] transition-colors uppercase tracking-widest">
                All →
              </Link>
            </div>
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#2a2a2a] text-sm mb-3">No jobs posted yet</p>
                <Link href="/company/jobs/create"
                      className="text-[#00ff87] text-xs uppercase tracking-widest">
                  Post first job →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/company/jobs/${job.id}/pipeline`}
                    className="flex items-center justify-between p-3 border border-[#161616] rounded-sm hover:border-[#2a2a2a] transition-all group"
                  >
                    <div className="min-w-0">
                      <p className="text-white text-xs font-medium group-hover:text-[#00ff87] transition-colors truncate">
                        {job.title}
                      </p>
                      <p className="text-[#333] text-xs mt-0.5">{job.location}</p>
                    </div>
                    <span className="text-[#333] text-xs ml-2 flex-shrink-0">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"
         style={{ fontFamily: "'DM Mono', monospace" }}>
      <div className="text-center space-y-2">
        <div className="text-white font-bold tracking-[0.2em] uppercase text-sm">
          Hire<span className="text-[#00ff87]">Flow</span>
        </div>
        <div className="flex gap-1 justify-center">
          {[0,1,2].map((i) => (
            <div key={i}
                 className="w-1.5 h-1.5 bg-[#00ff87] rounded-full animate-bounce"
                 style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

**Folder summary:**
```
frontend/app/
├── (user)/
│   ├── applications/page.tsx   ✅ list + detail + timeline
│   └── resume/page.tsx         ✅ upload + parsed + ATS
└── (company)/
    └── dashboard/page.tsx      ✅ funnel + stats + jobs