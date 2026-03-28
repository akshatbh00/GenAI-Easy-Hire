"use client";

const JOB_TYPES = ["fulltime", "parttime", "contract", "internship", "remote"] as const;

const POPULAR_TITLES = [
  "Software Engineer", "Product Manager", "Data Scientist",
  "Frontend Developer", "Backend Developer", "DevOps Engineer",
  "UI/UX Designer", "Business Analyst", "Marketing Manager",
  "Sales Executive", "HR Manager", "Finance Analyst",
];

interface Props {
  onNext: (data: { job_titles: string[]; job_type: string }) => void;
}

export default function StepJobType({ onNext }: Props) {
  const [selectedTitles, setTitles] = useState<string[]>([]);
  const [customTitle, setCustom]    = useState("");
  const [jobType, setJobType]       = useState("fulltime");

  function toggleTitle(t: string) {
    setTitles((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function addCustom() {
    if (customTitle.trim() && !selectedTitles.includes(customTitle.trim())) {
      setTitles((p) => [...p, customTitle.trim()]);
      setCustom("");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-white text-xl font-medium mb-1">What kind of work are you looking for?</h2>
        <p className="text-[#555] text-sm">Select all that apply. You can change this later.</p>
      </div>

      {/* Job titles */}
      <div>
        <label className="block text-[#888] text-xs uppercase tracking-widest mb-3">
          Target Roles
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {POPULAR_TITLES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTitle(t)}
              className={`px-3 py-1.5 text-xs border rounded-sm transition-all ${
                selectedTitles.includes(t)
                  ? "bg-[#00ff87] text-black border-[#00ff87] font-bold"
                  : "bg-transparent text-[#666] border-[#222] hover:border-[#444] hover:text-[#aaa]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {/* Custom title */}
        <div className="flex gap-2">
          <input
            value={customTitle}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="Add custom role..."
            className="flex-1 bg-[#161616] border border-[#2a2a2a] text-white text-sm px-3 py-2 rounded-sm outline-none focus:border-[#00ff87] placeholder:text-[#333]"
          />
          <button
            type="button"
            onClick={addCustom}
            className="px-4 py-2 border border-[#2a2a2a] text-[#888] text-sm rounded-sm hover:border-[#00ff87] hover:text-[#00ff87] transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Job type */}
      <div>
        <label className="block text-[#888] text-xs uppercase tracking-widest mb-3">
          Employment Type
        </label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {JOB_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setJobType(t)}
              className={`py-2 text-xs uppercase tracking-wider border rounded-sm transition-all ${
                jobType === t
                  ? "bg-[#00ff87] text-black border-[#00ff87] font-bold"
                  : "text-[#555] border-[#222] hover:border-[#444]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onNext({ job_titles: selectedTitles, job_type: jobType })}
        disabled={selectedTitles.length === 0}
        className="w-full bg-[#00ff87] text-black text-sm font-bold py-3 rounded-sm uppercase tracking-widest hover:bg-[#00e87a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Continue →
      </button>
    </div>
  );
}

import { useState } from "react";