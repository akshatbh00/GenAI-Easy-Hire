"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { jobsApi } from "@/lib/api";
import Link from "next/link";

const JOB_TYPES = ["fulltime","parttime","contract","internship","remote"];

export default function CreateJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title:        "",
    description:  "",
    location:     "",
    job_type:     "fulltime",
    remote_ok:    false,
    salary_min:   "",
    salary_max:   "",
    requirements: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  function set(field: string, val: any) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const job = await jobsApi.create({
        title:        form.title,
        description:  form.description,
        location:     form.location,
        job_type:     form.job_type,
        remote_ok:    form.remote_ok,
        salary_min:   form.salary_min ? parseInt(form.salary_min) : undefined,
        salary_max:   form.salary_max ? parseInt(form.salary_max) : undefined,
        requirements: form.requirements.split(",").map((s) => s.trim()).filter(Boolean),
      });
      router.push(`/company/jobs/${job.id}/pipeline`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]"
         style={{ fontFamily: "'DM Mono', monospace" }}>

      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10">
        <Link href="/company/dashboard"
              className="text-white font-bold tracking-[0.2em] uppercase text-sm">
          Hire<span className="text-[#00ff87]">Flow</span>
        </Link>
        <Link href="/company/dashboard"
              className="text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors">
          ← Dashboard
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold tracking-tight">Post a Job</h1>
          <p className="text-[#444] text-sm mt-1">
            Job description will be AI-embedded for candidate matching
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-950/40 border border-red-900/50 rounded-sm text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <Field label="Job Title" required>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              placeholder="e.g. Senior Backend Engineer"
              className={INPUT}
            />
          </Field>

          <Field label="Description" required>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
              rows={6}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              className={INPUT + " resize-none"}
            />
          </Field>

          <Field label="Requirements (comma separated)">
            <input
              value={form.requirements}
              onChange={(e) => set("requirements", e.target.value)}
              placeholder="Python, FastAPI, PostgreSQL, Docker"
              className={INPUT}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Location">
              <input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Bangalore, India"
                className={INPUT}
              />
            </Field>
            <Field label="Job Type">
              <select
                value={form.job_type}
                onChange={(e) => set("job_type", e.target.value)}
                className={INPUT}
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Min Salary (₹)">
              <input
                type="number"
                value={form.salary_min}
                onChange={(e) => set("salary_min", e.target.value)}
                placeholder="500000"
                className={INPUT}
              />
            </Field>
            <Field label="Max Salary (₹)">
              <input
                type="number"
                value={form.salary_max}
                onChange={(e) => set("salary_max", e.target.value)}
                placeholder="1200000"
                className={INPUT}
              />
            </Field>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set("remote_ok", !form.remote_ok)}
              className={`w-10 h-5 rounded-full transition-all relative ${
                form.remote_ok ? "bg-[#00ff87]" : "bg-[#1a1a1a]"
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                form.remote_ok ? "left-5" : "left-0.5"
              }`} />
            </button>
            <span className="text-[#666] text-xs uppercase tracking-widest">Remote OK</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00ff87] text-black text-sm font-bold py-3 rounded-sm uppercase tracking-widest hover:bg-[#00e87a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Posting + Embedding JD..." : "Post Job →"}
          </button>
        </form>
      </main>
    </div>
  );
}

const INPUT = "w-full bg-[#0f0f0f] border border-[#1e1e1e] text-white text-sm px-4 py-3 rounded-sm outline-none focus:border-[#00ff87] transition-colors placeholder:text-[#2a2a2a]";

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[#666] text-xs uppercase tracking-widest mb-2">
        {label}{required && <span className="text-[#00ff87] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}