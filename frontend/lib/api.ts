/**
 * lib/api.ts — typed API client for all backend calls
 * Uses fetch with auto JWT injection from localStorage
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ── Core fetch wrapper ─────────────────────────────────────────────────────

async function req<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = localStorage.getItem("hf_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

// ── Auth ───────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
  }) => req<TokenResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }, false),

  login: (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    }).then((r) => r.json()) as Promise<TokenResponse>;
  },

  me: () => req<UserOut>("/auth/me"),

  onboarding: (body: {
    job_titles: string[];
    locations: string[];
    job_type: string;
  }) => req<UserOut>("/auth/onboarding", { method: "PATCH", body: JSON.stringify(body) }),
};

// ── Resume ─────────────────────────────────────────────────────────────────

export const resumeApi = {
  upload: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const token = localStorage.getItem("hf_token");
    return fetch(`${BASE}/resume/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    }).then((r) => r.json()) as Promise<{ resume_id: string; status: string }>;
  },

  me:           ()                          => req<ResumeOut>("/resume/me"),
  ats:          (id: string)                => req<AtsReport>(`/resume/${id}/ats`),
  benchmark:    (id: string, title: string) => req<BenchmarkResult>(`/resume/${id}/benchmark?job_title=${encodeURIComponent(title)}`),
  matchedJobs:  (id: string, limit = 20)    => req<JobOut[]>(`/resume/${id}/jobs?limit=${limit}`),
};

// ── Jobs ───────────────────────────────────────────────────────────────────

export const jobsApi = {
  list: (params?: {
    job_type?: string;
    location?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return req<JobOut[]>(`/jobs${q ? "?" + q : ""}`);
  },

  get:        (id: string)      => req<JobOut>(`/jobs/${id}`),
  candidates: (id: string)      => req<CandidateOut[]>(`/jobs/${id}/candidates`),
  create:     (body: JobCreate) => req<JobOut>("/jobs", { method: "POST", body: JSON.stringify(body) }),
  delete:     (id: string)      => req<null>(`/jobs/${id}`, { method: "DELETE" }),
};

// ── Applications ───────────────────────────────────────────────────────────

export const applicationsApi = {
  apply:   (job_id: string, resume_id?: string) =>
    req<ApplicationOut>("/applications", {
      method: "POST",
      body: JSON.stringify({ job_id, resume_id }),
    }),
  list:    ()          => req<ApplicationOut[]>("/applications"),
  get:     (id: string) => req<ApplicationOut>(`/applications/${id}`),
  history: (id: string) => req<StageHistory[]>(`/applications/${id}/history`),
  withdraw:(id: string) => req<null>(`/applications/${id}/withdraw`, { method: "DELETE" }),
};

// ── Users ──────────────────────────────────────────────────────────────────

export const usersApi = {
  dashboard:         ()           => req<DashboardOut>("/users/dashboard"),
  updateProfile:     (body: any)  => req<UserOut>("/users/me", { method: "PATCH", body: JSON.stringify(body) }),
  markNotifsRead:    ()           => req<any>("/users/notifications/read", { method: "POST" }),
};

// ── Pipeline ───────────────────────────────────────────────────────────────

export const pipelineApi = {
  move: (application_id: string, to_stage: string, notes?: string) =>
    req<any>("/pipeline/move", {
      method: "POST",
      body: JSON.stringify({ application_id, to_stage, notes }),
    }),
  kanban:  (job_id: string)  => req<any>(`/pipeline/job/${job_id}/kanban`),
  history: (app_id: string)  => req<StageHistory[]>(`/pipeline/application/${app_id}/history`),
};

// ── Premium ────────────────────────────────────────────────────────────────

export const premiumApi = {
  tailor:      (resume_id: string, job_id: string) =>
    req<any>("/premium/tailor", { method: "POST", body: JSON.stringify({ resume_id, job_id }) }),
  bullets:     (bullets: string[], job_title: string) =>
    req<any>("/premium/bullets", { method: "POST", body: JSON.stringify({ bullets, job_title }) }),
  gapAnalysis: (job_title: string) =>
    req<any>(`/premium/gap-analysis?job_title=${encodeURIComponent(job_title)}`),
};

// ── Company ────────────────────────────────────────────────────────────────

export const companyApi = {
  me:     ()          => req<CompanyOut>("/companies/me"),
  stats:  ()          => req<CompanyStats>("/companies/me/stats"),
  invite: (email: string, company_id: string) =>
    req<any>(`/companies/${company_id}/invite`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};

// ── Types ──────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type:   string;
  user_id:      string;
  role:         string;
  tier:         string;
}

export interface UserOut {
  id:        string;
  email:     string;
  full_name: string;
  role:      string;
  tier:      string;
  is_active: boolean;
}

export interface ResumeOut {
  resume_id:   string;
  ats_score:   number;
  ats_report:  AtsReport;
  parsed_data: ParsedResume;
  file_url:    string;
}

export interface AtsReport {
  score:            number;
  breakdown:        Record<string, number>;
  issues:           string[];
  missing_sections: string[];
}

export interface BenchmarkResult {
  percentile:       number;
  similarity_score: number;
  pool_size:        number;
  skill_gaps:       string[];
  strength_skills:  string[];
  improvement_pts:  number;
}

export interface ParsedResume {
  name:                    string;
  email:                   string;
  skills:                  string[];
  total_experience_years:  number;
  current_title:           string;
  experience:              any[];
  education:               any[];
}

export interface JobOut {
  id:           string;
  title:        string;
  description:  string;
  job_type:     string;
  location:     string;
  remote_ok:    boolean;
  salary_min:   number | null;
  salary_max:   number | null;
  company_name: string;
  match_score:  number | null;
}

export interface JobCreate {
  title:        string;
  description:  string;
  requirements: string[];
  job_type:     string;
  location:     string;
  remote_ok:    boolean;
  salary_min?:  number;
  salary_max?:  number;
}

export interface ApplicationOut {
  id:              string;
  job_id:          string;
  user_id:         string;
  current_stage:   string;
  highest_stage:   string;
  match_score:     number | null;
  benchmark_score: number | null;
  job_title:       string;
  company_name:    string;
}

export interface StageHistory {
  from_stage: string;
  to_stage:   string;
  notes:      string | null;
  moved_at:   string;
}

export interface DashboardOut {
  user_id:          string;
  full_name:        string;
  tier:             string;
  active_resume:    any;
  highest_stage:    string | null;
  total_applied:    number;
  active_pipeline:  any[];
  top_job_matches:  any[];
  notifications:    any[];
}

export interface CandidateOut {
  resume_id:   string;
  user_id:     string;
  full_name:   string;
  email:       string;
  match_score: number;
  ats_score:   number;
}

export interface CompanyOut {
  id:          string;
  name:        string;
  slug:        string;
  website:     string;
  description: string;
  logo_url:    string;
}

export interface CompanyStats {
  active_jobs:        number;
  total_applicants:   number;
  pipeline_breakdown: Record<string, number>;
}