"use client";

import { useEffect, useState } from "react";
import { applicationsApi, ApplicationOut } from "@/lib/api";
import StageTracker from "@/components/dashboard/stage-tracker";
import Link from "next/link";

const STAGE_COLORS: Record<string, string> = {
  selected:      "text-[#00ff87] border-[#00ff87]/30 bg-[#00ff87]/5",
  offer:         "text-[#00ff87] border-[#00ff87]/30 bg-[#00ff87]/5",
  hr_round:      "text-blue-400 border-blue-900/30 bg-blue-950/20",
  round_1:       "text-blue-400 border-blue-900/30 bg-blue-950/20",
  round_2:       "text-blue-400 border-blue-900/30 bg-blue-950/20",
  round_3:       "text-blue-400 border-blue-900/30 bg-blue-950/20",
  ats_rejected:  "text-red-400 border-red-900/30 bg-red-950/20",
  ats_screening: "text-amber-400 border-amber-900/30 bg-amber-950/20",
  applied:       "text-[#555] border-[#222] bg-transparent",
  withdrawn:     "text-[#333] border-[#1a1a1a] bg-transparent",
};


export default function ApplicationsPage() {
  const [apps, setApps]       = useState<ApplicationOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ApplicationOut | null>(null);
  const [history, setHistory]   = useState<any[]>([]);

  useEffect(() => {
    applicationsApi.list()
      .then(setApps)
      .finally(() => setLoading(false));
  }, []);

  async function openDetail(app: ApplicationOut) {
    setSelected(app);
    const h = await applicationsApi.history(app.id);
    setHistory(h);
  }

  async function handleWithdraw(appId: string) {
    await applicationsApi.withdraw(appId);
    setApps((prev) => prev.filter((a) => a.id !== appId));
    setSelected(null);
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
        <div className="flex gap-6">
          <Link href="/dashboard" className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">Dashboard</Link>
          <Link href="/jobs"      className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">Jobs</Link>
          <Link href="/resume"    className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">Resume</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold tracking-tight">My Applications</h1>
          <p className="text-[#444] text-sm mt-1">{apps.length} total · full pipeline transparency</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-[#1a1a1a] bg-[#0f0f0f] rounded-sm p-5 animate-pulse h-24" />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#1a1a1a] rounded-sm">
            <p className="text-[#333] text-sm mb-3">No applications yet</p>
            <Link href="/jobs"
                  className="inline-block px-5 py-2 bg-[#00ff87] text-black text-xs font-bold uppercase tracking-widest rounded-sm">
              Browse Jobs →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Application list */}
            <div className="lg:col-span-2 space-y-2">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => openDetail(app)}
                  className={`w-full text-left border rounded-sm p-4 transition-all hover:border-[#2a2a2a] ${
                    selected?.id === app.id
                      ? "border-[#00ff87]/30 bg-[#00ff87]/5"
                      : "border-[#1e1e1e] bg-[#0f0f0f]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{app.job_title}</p>
                      <p className="text-[#444] text-xs mt-0.5">{app.company_name}</p>
                    </div>
                    <span className={`px-2 py-0.5 border rounded-sm text-xs uppercase tracking-wider flex-shrink-0 ${
                      STAGE_COLORS[app.current_stage] ?? "text-[#555] border-[#222]"
                    }`}>
                      {app.current_stage.replace(/_/g, " ")}
                    </span>
                  </div>

                  {app.match_score && (
                    <p className="text-[#00ff87] text-xs mt-2">
                      {Math.round(app.match_score)}% match
                    </p>
                  )}
                </button>
              ))}
            </div>

            {/* Detail panel */}
            <div className="lg:col-span-3">
              {selected ? (
                <div className="border border-[#1e1e1e] bg-[#0f0f0f] rounded-sm p-6 space-y-6 sticky top-20">

                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-white text-lg font-medium">{selected.job_title}</h2>
                      <p className="text-[#444] text-sm">{selected.company_name}</p>
                    </div>
                    <button
                      onClick={() => handleWithdraw(selected.id)}
                      className="text-[#333] text-xs hover:text-red-400 transition-colors uppercase tracking-widest"
                    >
                      Withdraw
                    </button>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-[#1a1a1a] rounded-sm p-3 text-center">
                      <p className="text-[#555] text-xs uppercase tracking-widest mb-1">Match</p>
                      <p className="text-[#00ff87] text-xl font-bold">
                        {selected.match_score ? `${Math.round(selected.match_score)}%` : "—"}
                      </p>
                    </div>
                    <div className="border border-[#1a1a1a] rounded-sm p-3 text-center">
                      <p className="text-[#555] text-xs uppercase tracking-widest mb-1">Benchmark</p>
                      <p className="text-white text-xl font-bold">
                        {selected.benchmark_score ? `${Math.round(selected.benchmark_score)}%` : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Pipeline tracker */}
                  <div>
                    <p className="text-[#555] text-xs uppercase tracking-widest mb-3">Pipeline</p>
                    <StageTracker
                      currentStage={selected.current_stage}
                      highestStage={selected.highest_stage}
                      rejected={selected.current_stage === "ats_rejected"}
                    />
                  </div>

                  {/* Stage history timeline */}
                  {history.length > 0 && (
                    <div>
                      <p className="text-[#555] text-xs uppercase tracking-widest mb-3">
                        Full History
                      </p>
                      <div className="space-y-2">
                        {history.map((h, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2a2a2a] flex-shrink-0" />
                            <div>
                              <p className="text-[#888] text-xs">
                                <span className="text-[#555]">{h.from_stage?.replace(/_/g," ")}</span>
                                <span className="text-[#333]"> → </span>
                                <span className="text-white">{h.to_stage?.replace(/_/g," ")}</span>
                              </p>
                              {h.notes && (
                                <p className="text-[#444] text-xs mt-0.5 italic">"{h.notes}"</p>
                              )}
                              <p className="text-[#2a2a2a] text-xs mt-0.5">
                                {new Date(h.moved_at).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-dashed border-[#1a1a1a] rounded-sm h-64 flex items-center justify-center">
                  <p className="text-[#2a2a2a] text-sm">Select an application to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}