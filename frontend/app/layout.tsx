import { DM_Mono } from "next/font/google";
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["300","400","500"] });
```

---

**What's wired now:**
```
✅ Full typed API client (all endpoints)
✅ Token management + auth helpers
✅ Zustand store with persistence
✅ Login page — dark, sharp, branded
✅ Register page — role toggle (jobseeker/recruiter)
✅ Onboarding — 2-step: job prefs + resume upload
✅ Drag & drop resume uploader