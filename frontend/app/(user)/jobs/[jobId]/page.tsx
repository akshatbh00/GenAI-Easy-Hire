"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { jobsApi, applicationsApi, JobOut } from "@/lib/api";
import Link from "next/link";

export default function JobDetailPage() {
  const { jobId }         = useParams<{ jobId: string }>();
  const router            = useRouter();
  const [job, setJob]     = useState<JobOut | null>(null);
  const [loading, setLoading]   = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    jobsApi.get(jobId)
      .then(setJob)
      .finally(() => setLoading(false));
  }, [jobId]);

  async function handleApply() {
    setApplying(true);
    setError("");
    try {
      await applicationsApi.apply(jobId);
      setApplied(true);
    } catch (e: any) {
      if (e.message?.includes("Already applied")) setApplied(true);
      else setError(e.message);
    } finally {
      setApplying(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"
         style={{ fontFamily: "'DM Mono', monospace" }}>
      <div className="flex gap-1">
        {[0,1,2].map((i) => (
          <div key={i} className="w-1.5 h-1.5 bg-[#00ff87] rounded-full animate-bounce"
               style={{ animationDelay: `${i*0.15}s` }} />
        ))}
      </div>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"
         style={{ fontFamily: "'DM Mono', monospace" }}>
      <div className="text-center">
        <p className="text-[#333] text-sm mb-3">Job not found</p>
        <Link href="/jobs" className="text-[#00ff87] text-xs uppercase tracking-widest">
          ← Back to Jobs
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]"
         style={{ fontFamily: "'DM Mono', monospace" }}>

      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10">
        <Link href="/dashboard"
              className="text-white font-bold tracking-[0.2em] uppercase text-sm">
          Hire<span className="text-[#00ff87]">Flow</span>
        </Link>
        <Link href="/jobs"
              className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">
          ← Back to Jobs
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight">{job.title}</h1>
              <p className="text-[#555] text-sm mt-1">{job.company_name}</p>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
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
                    ₹{(job.salary_min/100000).toFixed(1)}L
                    {job.salary_max ? `–${(job.salary_max/100000).toFixed(1)}L` : "+"}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="border border-[#1e1e1e] bg-[#0f0f0f] rounded-sm p-6">
              <p className="text-[#888] text-xs uppercase tracking-widest mb-4">
                Description
              </p>
              <p className="text-[#888] text-sm leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Match score */}
            {job.match_score && (
              <div className="border border-[#00ff87]/20 bg-[#00ff87]/5 rounded-sm p-5 text-center">
                <p className="text-[#555] text-xs uppercase tracking-widest mb-2">
                  Your Match
                </p>
                <p className="text-[#00ff87] text-4xl font-bold">
                  {Math.round(job.match_score)}%
                </p>
                <p className="text-[#444] text-xs mt-1">AI compatibility score</p>
              </div>
            )}

            {/* Apply button */}
            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}
            <button
              onClick={handleApply}
              disabled={applied || applying}
              className={`w-full py-3 text-sm font-bold uppercase tracking-widest rounded-sm transition-all ${
                applied
                  ? "bg-transparent border border-[#00ff87]/30 text-[#00ff87]/50 cursor-default"
                  : "bg-[#00ff87] text-black hover:bg-[#00e87a]"
              } disabled:cursor-not-allowed`}
            >
              {applied ? "Applied ✓" : applying ? "Applying..." : "Apply Now →"}
            </button>

            {applied && (
              <Link
                href="/applications"
                className="block text-center text-[#555] text-xs uppercase tracking-widest hover:text-[#00ff87] transition-colors"
              >
                Track in pipeline →
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}