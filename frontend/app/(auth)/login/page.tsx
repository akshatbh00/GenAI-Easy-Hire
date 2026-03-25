"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserStore } from "@/store/user.store";

export default function LoginPage() {
  const router    = useRouter();
  const { login, isLoading, error, clearError } = useUserStore();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4"
         style={{ fontFamily: "'DM Mono', monospace" }}>

      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.03]"
           style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="mb-10 text-center">
          <span className="text-white text-2xl font-bold tracking-[0.2em] uppercase">
            Hire<span className="text-[#00ff87]">Flow</span>
          </span>
          <p className="text-[#555] text-xs mt-2 tracking-widest uppercase">
            Transparent Hiring
          </p>
        </div>

        {/* Card */}
        <div className="border border-[#1e1e1e] bg-[#0f0f0f] p-8 rounded-sm">
          <h1 className="text-white text-lg font-medium mb-1 tracking-tight">
            Sign in
          </h1>
          <p className="text-[#555] text-sm mb-8">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#00ff87] hover:underline">
              Register
            </Link>
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-950/40 border border-red-900/50 rounded-sm text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#888] text-xs uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#161616] border border-[#2a2a2a] text-white text-sm px-4 py-3 rounded-sm outline-none focus:border-[#00ff87] transition-colors placeholder:text-[#333]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00ff87] text-black text-sm font-bold py-3 rounded-sm uppercase tracking-widest hover:bg-[#00e87a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
        </div>

        <p className="text-center text-[#333] text-xs mt-6 tracking-wider">
          © 2025 HireFlow · Built for transparency
        </p>
      </div>
    </div>
  );
}