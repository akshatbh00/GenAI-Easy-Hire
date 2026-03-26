"use client";

import { useEffect, useState, useRef } from "react";
import { resumeApi, ResumeOut } from "@/lib/api";
import AtsScoreDisplay from "@/components/resume/ats-score-display";
import Link from "next/link";

export default function ResumePage() {
  const [resume, setResume]   = useState<ResumeOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadResume(); }, []);

  async function loadResume() {
    try {
      const r = await resumeApi.me();
      setResume(r);
    } catch {
      setResume(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      await resumeApi.upload(file);
      // poll until processed
      setTimeout(loadResume, 3000);
    } finally {
      setUploading(false);
    }
  }

  const parsed = resume?.parsed_data;

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
          <Link href="/dashboard"    className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">Dashboard</Link>
          <Link href="/jobs"         className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">Jobs</Link>
          <Link href="/applications" className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">Applications</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">My Resume</h1>
            <p className="text-[#444] text-sm mt-1">AI analysis + ATS report</p>
          </div>

          {/* Upload button */}
          <div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-5 py-2.5 border border-[#2a2a2a] text-[#888] text-xs uppercase tracking-widest rounded-sm hover:border-[#00ff87] hover:text-[#00ff87] transition-colors disabled:opacity-40"
            >
              {uploading ? "Uploading..." : resume ? "Replace Resume" : "Upload Resume"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1,2,3].map((i) => (
              <div key={i} className="border border-[#1a1a1a] bg-[#0f0f0f] rounded-sm p-6 animate-pulse h-48" />
            ))}
          </div>
        ) : !resume ? (
          /* Empty state */
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault(); setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleUpload(f);
            }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-sm p-20 text-center cursor-pointer transition-all ${
              dragging ? "border-[#00ff87] bg-[#00ff87]/5" : "border-[#1a1a1a] hover:border-[#2a2a2a]"
            }`}
          >
            <p className="text-[#333] text-3xl mb-3">↑</p>
            <p className="text-[#555] text-sm">Drop your resume or click to upload</p>
            <p className="text-[#2a2a2a] text-xs mt-1">PDF · DOCX</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left — parsed info */}
            <div className="lg:col-span-2 space-y-6">

              {/* Identity card */}
              <div className="border border-[#1e1e1e] bg-[#0f0f0f] rounded-sm p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-white text-lg font-medium">
                      {parsed?.name ?? "—"}
                    </h2>
                    <p className="text-[#555] text-sm mt-0.5">
                      {parsed?.current_title ?? ""}
                    </p>
                    <p className="text-[#333] text-xs mt-1">
                      {parsed?.email ?? ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#00ff87] text-2xl font-bold">
                      {parsed?.total_experience_years ?? 0}
                    </p>
                    <p className="text-[#444] text-xs">yrs exp</p>
                  </div>
                </div>

                {/* Skills */}
                {parsed?.skills?.length > 0 && (
                  <div>
                    <p className="text-[#555] text-xs uppercase tracking-widest mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {parsed.skills.slice(0, 20).map((s: string) => (
                        <span key={s}
                              className="px-2 py-0.5 border border-[#222] text-[#888] text-xs rounded-sm">
                          {s}
                        </span>
                      ))}
                      {parsed.skills.length > 20 && (
                        <span className="text-[#333] text-xs px-2 py-0.5">
                          +{parsed.skills.length - 20} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Experience */}
              {parsed?.experience?.length > 0 && (
                <div className="border border-[#1e1e1e] bg-[#0f0f0f] rounded-sm p-6">
                  <p className="text-[#555] text-xs uppercase tracking-widest mb-4">Experience</p>
                  <div className="space-y-4">
                    {parsed.experience.map((exp: any, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00ff87]/40 flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-medium">{exp.title}</p>
                          <p className="text-[#555] text-xs">{exp.company}</p>
                          {exp.duration_months && (
                            <p className="text-[#333] text-xs mt-0.5">
                              {Math.round(exp.duration_months / 12 * 10) / 10} yrs
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {parsed?.education?.length > 0 && (
                <div className="border border-[#1e1e1e] bg-[#0f0f0f] rounded-sm p-6">
                  <p className="text-[#555] text-xs uppercase tracking-widest mb-4">Education</p>
                  <div className="space-y-3">
                    {parsed.education.map((edu: any, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#444] flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm">{edu.degree}</p>
                          <p className="text-[#555] text-xs">{edu.institution}</p>
                          {edu.year && <p className="text-[#333] text-xs">{edu.year}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right — ATS report */}
            <div className="space-y-4">
              {resume.ats_report && (
                <AtsScoreDisplay report={resume.ats_report} />
              )}

              {/* Download link */}
              {resume.file_url && (
                
                  href={resume.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 border border-[#222] text-[#555] text-xs uppercase tracking-widest rounded-sm hover:border-[#00ff87] hover:text-[#00ff87] transition-colors"
                >
                  Download Original ↓
                </a>
              )}

              {/* Premium CTA */}
              <div className="border border-[#00ff87]/20 bg-[#00ff87]/5 rounded-sm p-5">
                <p className="text-[#00ff87] text-xs uppercase tracking-widest font-bold mb-2">
                  Premium Optimizer
                </p>
                <p className="text-[#666] text-xs leading-relaxed mb-4">
                  Get exact section rewrites tailored to a specific job description.
                </p>
                <Link
                  href="/jobs"
                  className="block text-center py-2 bg-[#00ff87] text-black text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#00e87a] transition-colors"
                >
                  Pick a Job to Tailor →
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}