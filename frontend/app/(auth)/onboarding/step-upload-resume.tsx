"use client";

import { useState, useRef } from "react";
import { resumeApi } from "@/lib/api";

interface Props {
  onDone: () => void;
}

export default function StepUploadResume({ onDone }: Props) {
  const [file, setFile]         = useState<File | null>(null);
  const [status, setStatus]     = useState<"idle"|"uploading"|"done"|"error">("idle");
  const [errorMsg, setError]    = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!["application/pdf","application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type)) {
      setError("Only PDF or DOCX files are supported");
      return;
    }
    setFile(f);
    setError("");
  }

  async function upload() {
    if (!file) return;
    setStatus("uploading");
    try {
      await resumeApi.upload(file);
      setStatus("done");
      setTimeout(onDone, 1200);
    } catch (e: any) {
      setStatus("error");
      setError(e.message);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-white text-xl font-medium mb-1">Upload your resume</h2>
        <p className="text-[#555] text-sm">PDF or DOCX · Max 5MB · We'll analyse it instantly</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-all ${
          dragging
            ? "border-[#00ff87] bg-[#00ff87]/5"
            : file
            ? "border-[#00ff87]/40 bg-[#00ff87]/5"
            : "border-[#222] hover:border-[#333]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {file ? (
          <div className="space-y-2">
            <div className="text-[#00ff87] text-2xl">✓</div>
            <p className="text-white text-sm font-medium">{file.name}</p>
            <p className="text-[#555] text-xs">{(file.size / 1024).toFixed(0)} KB</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="text-[#555] text-xs hover:text-[#888] underline mt-1"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[#333] text-3xl">↑</div>
            <p className="text-[#666] text-sm">Drop your resume here or click to browse</p>
            <p className="text-[#333] text-xs">PDF · DOCX</p>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="text-red-400 text-sm">{errorMsg}</p>
      )}

      {status === "done" && (
        <div className="px-4 py-3 bg-emerald-950/40 border border-emerald-900/50 rounded-sm text-emerald-400 text-sm">
          ✓ Resume uploaded — running AI analysis...
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={upload}
          disabled={!file || status === "uploading" || status === "done"}
          className="flex-1 bg-[#00ff87] text-black text-sm font-bold py-3 rounded-sm uppercase tracking-widest hover:bg-[#00e87a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {status === "uploading" ? "Uploading..." : status === "done" ? "Done ✓" : "Upload Resume →"}
        </button>
        <button
          onClick={onDone}
          className="px-6 py-3 border border-[#222] text-[#555] text-sm rounded-sm hover:border-[#333] hover:text-[#888] transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}