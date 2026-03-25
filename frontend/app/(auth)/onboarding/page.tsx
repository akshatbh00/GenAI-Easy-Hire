"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import StepJobType from "./step-job-type";
import StepUploadResume from "./step-upload-resume";

const STEPS = ["Job Preferences", "Resume Upload"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<{ job_titles: string[]; job_type: string } | null>(null);

  async function handleJobType(data: { job_titles: string[]; job_type: string }) {
    setPrefs(data);
    await authApi.onboarding({ ...data, locations: [] });
    setStep(1);
  }

  function handleDone() {
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4"
         style={{ fontFamily: "'DM Mono', monospace" }}>

      <div className="fixed inset-0 opacity-[0.03]"
           style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative w-full max-w-lg">

        {/* Header */}
        <div className="mb-10">
          <span className="text-white text-xl font-bold tracking-[0.2em] uppercase">
            Hire<span className="text-[#00ff87]">Flow</span>
          </span>
          <p className="text-[#555] text-xs mt-1 tracking-widest uppercase">
            Setup · Step {step + 1} of {STEPS.length}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-1 rounded-full transition-all duration-500 ${
                i <= step ? "bg-[#00ff87]" : "bg-[#222]"
              } ${i === 0 ? "w-16" : "w-16"}`} />
              <span className={`text-xs uppercase tracking-widest ${
                i === step ? "text-[#00ff87]" : "text-[#333]"
              }`}>
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="border border-[#1e1e1e] bg-[#0f0f0f] p-8 rounded-sm">
          {step === 0 && <StepJobType onNext={handleJobType} />}
          {step === 1 && <StepUploadResume onDone={handleDone} />}
        </div>
      </div>
    </div>
  );
}