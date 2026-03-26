"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { pipelineApi, jobsApi } from "@/lib/api";
import KanbanBoard from "@/components/pipeline/kanban-board";
import Link from "next/link";

export default function PipelinePage() {
  const { jobId }           = useParams<{ jobId: string }>();
  const [kanban, setKanban] = useState<Record<string, any[]>>({});
  const [job, setJob]       = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [jobId]);

  async function loadData() {
    const [k, j] = await Promise.all([
      pipelineApi.kanban(jobId),
      jobsApi.get(jobId),
    ]);
    setKanban(k);
    setJob(j);
    setLoading(false);
  }

  async function handleMove(appId: string, toStage: string) {
    await pipelineApi.move(appId, toStage);
    // refresh kanban
    const k = await pipelineApi.kanban(jobId);
    setKanban(k);
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

  return (
    <div className="min-h-screen bg-[#0a0a0a]"
         style={{ fontFamily: "'DM Mono', monospace" }}>

      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10">
        <Link href="/company/dashboard"
              className="text-white font-bold tracking-[0.2em] uppercase text-sm">
          Hire<span className="text-[#00ff87]">Flow</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/company/jobs"
                className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">
            ← All Jobs
          </Link>
        </div>
      </nav>

      <main className="px-6 py-8">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-white text-xl font-bold tracking-tight">
              {job?.title ?? "Pipeline"}
            </h1>
            <p className="text-[#444] text-sm mt-1">
              {job?.company_name ?? ""} · Drag candidates between stages
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/company/jobs/${jobId}/candidates`}
              className="px-4 py-2 border border-[#222] text-[#555] text-xs uppercase tracking-widest rounded-sm hover:border-[#444] hover:text-[#888] transition-colors"
            >
              AI Rankings
            </Link>
          </div>
        </div>

        {/* Kanban */}
        <KanbanBoard kanban={kanban} onMove={handleMove} />

        {/* Legend */}
        <div className="mt-6 flex items-center gap-4 flex-wrap">
          <span className="text-[#2a2a2a] text-xs uppercase tracking-widest">Legend:</span>
          {[
            ["applied",      "#333"],
            ["in review",    "#60a5fa"],
            ["selected",     "#00ff87"],
            ["rejected",     "#ef4444"],
          ].map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[#333] text-xs uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}