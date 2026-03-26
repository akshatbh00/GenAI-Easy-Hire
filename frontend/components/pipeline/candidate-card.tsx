"use client";

interface Props {
  candidate: {
    application_id:  string;
    user_id:         string;
    match_score:     number | null;
    benchmark_score: number | null;
    applied_at:      string;
    full_name?:      string;
    ats_score?:      number;
  };
  onMove: (appId: string, stage: string) => void;
  stages: string[];
}

export default function CandidateCard({ candidate, onMove, stages }: Props) {
  return (
    <div className="border border-[#1e1e1e] bg-[#0a0a0a] rounded-sm p-3 space-y-2 hover:border-[#2a2a2a] transition-all group">

      {/* Name */}
      <p className="text-white text-xs font-medium truncate">
        {candidate.full_name ?? `Candidate ${candidate.user_id.slice(0,6)}`}
      </p>

      {/* Scores row */}
      <div className="flex items-center gap-2">
        {candidate.match_score != null && (
          <span className="text-[#00ff87] text-xs">
            {Math.round(candidate.match_score)}% match
          </span>
        )}
        {candidate.ats_score != null && (
          <span className="text-[#444] text-xs">
            ATS {Math.round(candidate.ats_score)}
          </span>
        )}
      </div>

      {/* Applied at */}
      <p className="text-[#2a2a2a] text-xs">
        {new Date(candidate.applied_at).toLocaleDateString("en-IN", {
          day: "numeric", month: "short"
        })}
      </p>

      {/* Move to stage dropdown */}
      <select
        onChange={(e) => { if (e.target.value) onMove(candidate.application_id, e.target.value); }}
        defaultValue=""
        className="w-full bg-[#111] border border-[#1a1a1a] text-[#555] text-xs px-2 py-1.5 rounded-sm outline-none focus:border-[#00ff87] transition-colors mt-1"
      >
        <option value="" disabled>Move to...</option>
        {stages.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ").toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}