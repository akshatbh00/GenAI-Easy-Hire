"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usersApi, DashboardOut } from "@/lib/api";
import { useUserStore } from "@/store/user.store";
import ScoreRing       from "@/components/dashboard/score-ring";
import StageTracker    from "@/components/dashboard/stage-tracker";
import MetricCard      from "@/components/dashboard/metric-card";
import ActivityFeed    from "@/components/dashboard/activity-feed";
import AtsScoreDisplay from "@/components/resume/ats-score-display";
import Link            from "next/link";

export default function DashboardPage() {
  const router            = useRouter();
  const { user, logout }  = useUserStore();
  const [data, setData]   = useState<DashboardOut | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.dashboard()
      .then(setData)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data)   return null;

  const resume      = data.active_resume;
  const topApp      = data.active_pipeline?.[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white"
         style={{ fontFamily: "'DM Mono', monospace" }}>

      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10">
        <span className="text-white font-bold tracking-[0.2em] uppercase text-sm">
          Hire<span className="text-[#00ff87]">Flow</span>
        </span>
        <div className="flex items-center gap-6">
          <Link href="/jobs"         className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">Jobs</Link>
          <Link href="/applications" className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">Applications</Link>
          <Link href="/resume"       className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">Resume</Link>
          {data.tier === "premium" && (
            <span className="px-2 py-0.5 bg-[#00ff87]/10 border border-[#00ff87]/30 text-[#00ff87] text-xs rounded-sm uppercase tracking-widest">
              Premium
            </span>
          )}
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="text-[#333] text-xs uppercase tracking-widest hover:text-[#888] transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* Hero row */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">
              Hey, {data.full_name?.split(" ")[0]} 👋
            </h1>
            <p className="text-[#444] text-sm mt-1">
              Here's your hiring snapshot
            </p>
          </div>
          <Link
            href="/jobs"
            className="px-5 py-2.5 bg-[#00ff87] text-black text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#00e87a] transition-colors"
          >
            Browse Jobs →
          </Link>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="ATS Score"
            value={resume?.ats_score ? `${Math.round(resume.ats_score)}` : "—"}
            sub="Resume friendliness"
            accent={!!resume?.ats_score}
          />
          <MetricCard
            label="Applied"
            value={data.total_applied}
            sub="Total applications"
          />
          <MetricCard
            label="Best Stage"
            value={data.highest_stage
              ? data.highest_stage.replace(/_/g, " ").toUpperCase()
              : "—"}
            sub="Highest reached"
            accent={!!data.highest_stage}
          />
          <MetricCard
            label="Job Matches"
            value={data.top_job_matches?.length ?? 0}
            sub="AI-matched roles"
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left col — 2/3 width */}
          <div className="lg:col-span-2 space-y-6">

            {/* Pipeline tracker */}
            {topApp && (
              <div className="border border-[#1e1e1e] bg-[#0f0f0f] rounded-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#888] text-xs uppercase tracking-widest">
                    Latest Application
                  </h2>
                  <Link href="/applications"
                        className="text-[#444] text-xs hover:text-[#00ff87] transition-colors uppercase tracking-widest">
                    View all →
                  </Link>
                </div>
                <p className="text-white text-sm font-medium mb-1">{topApp.job_title}</p>
                <p className="text-[#444] text-xs mb-5">{topApp.company}</p>
                <StageTracker
                  currentStage={topApp.current_stage}
                  highestStage={topApp.highest_stage}
                  rejected={topApp.current_stage === "ats_rejected"}
                />
              </div>
            )}

            {/* Top job matches */}
            {data.top_job_matches?.length > 0 && (
              <div className="border border-[#1e1e1e] bg-[#0f0f0f] rounded-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#888] text-xs uppercase tracking-widest">
                    AI Matched Jobs
                  </h2>
                  <Link href="/jobs"
                        className="text-[#444] text-xs hover:text-[#00ff87] transition-colors uppercase tracking-widest">
                    See all →
                  </Link>
                </div>
                <div className="space-y-2">
                  {data.top_job_matches.slice(0, 4).map((job: any, i: number) => (
                    <Link
                      key={i}
                      href={`/jobs/${job.id}`}
                      className="flex items-center justify-between p-3 border border-[#161616] rounded-sm hover:border-[#2a2a2a] hover:bg-[#111] transition-all group"
                    >
                      <div>
                        <p className="text-white text-sm group-hover:text-[#00ff87] transition-colors">
                          {job.title}
                        </p>
                        <p className="text-[#444] text-xs mt-0.5">{job.company_name}</p>
                      </div>
                      {job.score && (
                        <span className="text-[#00ff87] text-xs font-bold">
                          {Math.round(job.score * 100)}% match
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No resume prompt */}
            {!resume && (
              <div className="border border-dashed border-[#222] rounded-sm p-8 text-center">
                <p className="text-[#444] text-sm mb-3">No resume uploaded yet</p>
                <Link
                  href="/resume"
                  className="inline-block px-5 py-2 bg-[#00ff87] text-black text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#00e87a] transition-colors"
                >
                  Upload Resume →
                </Link>
              </div>
            )}
          </div>

          {/* Right col — 1/3 width */}
          <div className="space-y-6">

            {/* ATS score card */}
            {resume?.ats_score && resume?.ats_report && (
              <AtsScoreDisplay report={resume.ats_report} />
            )}

            {/* Benchmark score */}
            {topApp?.benchmark_score != null && (
              <div className="border border-[#1e1e1e] bg-[#0f0f0f] rounded-sm p-6 text-center">
                <p className="text-[#555] text-xs uppercase tracking-widest mb-4">
                  vs Selected Pool
                </p>
                <ScoreRing
                  score={Math.round(topApp.benchmark_score)}
                  label="Percentile"
                  size={100}
                />
                <p className="text-[#444] text-xs mt-4 leading-relaxed">
                  You score better than{" "}
                  <span className="text-white">
                    {Math.round(topApp.benchmark_score)}%
                  </span>{" "}
                  of selected candidates
                </p>
              </div>
            )}

            {/* Upgrade CTA — free users */}
            {data.tier === "free" && (
              <div className="border border-[#00ff87]/20 bg-[#00ff87]/5 rounded-sm p-5">
                <p className="text-[#00ff87] text-xs uppercase tracking-widest font-bold mb-2">
                  Premium
                </p>
                <p className="text-[#888] text-xs leading-relaxed mb-4">
                  Get exact resume rewrites, JD tailoring, bullet improvements and deep gap analysis.
                </p>
                <button className="w-full py-2 bg-[#00ff87] text-black text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#00e87a] transition-colors">
                  Upgrade →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Activity feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#888] text-xs uppercase tracking-widest">Activity</h2>
            {data.notifications?.length > 0 && (
              <button
                onClick={() => usersApi.markNotifsRead()}
                className="text-[#333] text-xs hover:text-[#555] transition-colors uppercase tracking-widest"
              >
                Mark all read
              </button>
            )}
          </div>
          <ActivityFeed notifications={data.notifications ?? []} />
        </div>

      </main>
    </div>
  );
}


function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"
         style={{ fontFamily: "'DM Mono', monospace" }}>
      <div className="space-y-2 text-center">
        <div className="text-white font-bold tracking-[0.2em] uppercase text-sm">
          Hire<span className="text-[#00ff87]">Flow</span>
        </div>
        <div className="flex gap-1 justify-center">
          {[0,1,2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 bg-[#00ff87] rounded-full animate-bounce"
                 style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}