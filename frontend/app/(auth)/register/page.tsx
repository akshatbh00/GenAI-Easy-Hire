"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserStore } from "@/store/user.store";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useUserStore();

  const [form, setForm] = useState({
    full_name: "",
    email:     "",
    password:  "",
    role:      "jobseeker",
  });

  function set(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    try {
      await register(form.email, form.password, form.full_name, form.role);
      router.push("/onboarding");
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4"
         style={{ fontFamily: "'DM Mono', monospace" }}>

      <div className="fixed inset-0 opacity-[0.03]"
           style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative w-full max-w-md">

        <div className="mb-10 text-center">
          <span className="text-white text-2xl font-bold tracking-[0.2em] uppercase">
            Hire<span className="text-[#00ff87]">Flow</span>
          </span>
          <p className="text-[#555] text-xs mt-2 tracking-widest uppercase">
            Transparent Hiring
          </p>
        </div>

        <div className="border border-[#1e1e1e] bg-[#0f0f0f] p-8 rounded-sm">
          <h1 className="text-white text-lg font-medium mb-1 tracking-tight">
            Create account
          </h1>
          <p className="text-[#555] text-sm mb-8">
            Already have one?{" "}
            <Link href="/login" className="text-[#00ff87] hover:underline">
              Sign in
            </Link>
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-950/40 border border-red-900/50 rounded-sm text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role toggle */}
            <div>
              <label className="block text-[#888] text-xs uppercase tracking-widest mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["jobseeker", "recruiter"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set("role", r)}
                    className={`py-2.5 text-xs uppercase tracking-widest border rounded-sm transition-all ${
                      form.role === r
                        ? "bg-[#00ff87] text-black border-[#00ff87] font-bold"
                        : "bg-transparent text-[#555] border-[#2a2a2a] hover:border-[#444]"
                    }`}
                  >
                    {r === "jobseeker" ? "Job Seeker" : "Recruiter"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#888] text-xs uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                required
                placeholder="Rahul Sharma"
                className="w-full bg-[#161616] border border-[#2a2a2a] text-white text-sm px-4 py-3 rounded-sm outline-none focus:border-[#00ff87] transition-colors placeholder:text-[#333]"
              />
            </div>

            <div>
              <label className="block text-[#888] text-xs uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full bg-[#161616] border border-[#2a2a2a] text-white text-sm px-4 py-3 rounded-sm outline-none focus:border-[#00ff87] transition-colors placeholder:text-[#333]"
              />
            </div>

            <div>
              <label className="block text-[#888] text-xs uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                minLength={8}
                placeholder="Min 8 characters"
                className="w-full bg-[#161616] border border-[#2a2a2a] text-white text-sm px-4 py-3 rounded-sm outline-none focus:border-[#00ff87] transition-colors placeholder:text-[#333]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00ff87] text-black text-sm font-bold py-3 rounded-sm uppercase tracking-widest hover:bg-[#00e87a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Create Account →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}