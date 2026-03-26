"use client";

import CandidateCard from "./candidate-card";

interface Props {
  stage:      string;
  candidates: any[];
  allStages:  string[];
  onMove:     (appId: string, toStage: string) => void;
}

const COLUMN_ACCENT: Record<string, string> = {
  selected:      "border-t-[#00ff87]",
  offer:         "border-t-[#00ff87]",
  hr_round:      "border-t-blue-500",
  round_1:       "border-t-blue-500",
  round_2:       "border-t-blue-500",
  round_3:       "border-t-blue-500",
  ats_rejected:  "border-t-red-500",
  ats_screening: "border-t-amber-500",
  applied:       "border-t-[#333]",
};

export default function KanbanColumn({ stage, candidates, allStages, onMove }: Props) {
  return (
    <div className={`flex-shrink-0 w-56 border border-[#1a1a1a] border-t-2 bg-[#0d0d0d] rounded-sm ${
      COLUMN_ACCENT[stage] ?? "border-t-[#333]"
    }`}>

      {/* Column header */}
      <div className="px-3 py-3 border-b border-[#141414] flex items-center justify-between">
        <span className="text-[#666] text-xs uppercase tracking-widest">
          {stage.replace(/_/g, " ")}
        </span>
        <span className="text-[#333] text-xs font-bold">
          {candidates.length}
        </span>
      </div>

      {/* Cards */}
      <div className="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-220px)] overflow-y-auto">
        {candidates.length === 0 ? (
          <div className="flex items-center justify-center h-20">
            <p className="text-[#1e1e1e] text-xs">empty</p>
          </div>
        ) : (
          candidates.map((c) => (
            <CandidateCard
              key={c.application_id}
              candidate={c}
              stages={allStages.filter((s) => s !== stage)}
              onMove={onMove}
            />
          ))
        )}
      </div>
    </div>
  );
}