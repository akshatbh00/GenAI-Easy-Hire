"""
scraper/adzuna_scraper.py — fetches jobs from Adzuna API
Free tier: 250 requests/day
Covers India with 100K+ active listings
"""
import httpx
from config import settings
from loguru import logger


ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs"

# Map our job types to Adzuna categories
CATEGORY_MAP = {
    "fulltime":   "it-jobs",
    "parttime":   "part-time-jobs",
    "contract":   "contract-jobs",
    "internship": "graduate-jobs",
    "remote":     "it-jobs",
}

INDIA_LOCATIONS = [
    "bangalore", "mumbai", "delhi", "hyderabad",
    "pune", "chennai", "kolkata", "noida", "gurgaon"
]


class AdzunaScraper:

    def __init__(self):
        self.app_id  = settings.ADZUNA_APP_ID
        self.app_key = settings.ADZUNA_APP_KEY
        self.country = settings.ADZUNA_COUNTRY

    def fetch_jobs(
        self,
        keywords:  str,
        location:  str = "india",
        page:      int = 1,
        per_page:  int = 20,
        category:  str = "it-jobs",
    ) -> list[dict]:
        """Fetch jobs from Adzuna API."""
        if not self.app_id or not self.app_key:
            logger.warning("Adzuna API credentials not configured")
            return []

        url    = f"{ADZUNA_BASE}/{self.country}/search/{page}"
        params = {
            "app_id":         self.app_id,
            "app_key":        self.app_key,
            "what":           keywords,
            "where":          location,
            "results_per_page": per_page,
            "category":       category,
            "content-type":   "application/json",
            "salary_include_unknown": 0,
        }

        try:
            with httpx.Client(timeout=15) as client:
                resp = client.get(url, params=params)
                resp.raise_for_status()
                data = resp.json()
                return data.get("results", [])
        except Exception as e:
            logger.error(f"Adzuna fetch failed: {e}")
            return []

    def fetch_by_category(self, category: str, pages: int = 2) -> list[dict]:
        """Fetch multiple pages for a category."""
        all_jobs = []
        for page in range(1, pages + 1):
            jobs = self.fetch_jobs(
                keywords="",
                location="india",
                page=page,
                per_page=20,
                category=category,
            )
            all_jobs.extend(jobs)
            if len(jobs) < 20:
                break
        return all_jobs

    def normalize(self, raw_job: dict) -> dict:
        """Normalize Adzuna job to HireFlow schema."""
        salary_min = raw_job.get("salary_min")
        salary_max = raw_job.get("salary_max")

        return {
            "title":       raw_job.get("title", "").strip(),
            "description": raw_job.get("description", "").strip(),
            "location":    raw_job.get("location", {}).get("display_name", "India"),
            "company":     raw_job.get("company", {}).get("display_name", "Unknown"),
            "salary_min":  int(salary_min) if salary_min else None,
            "salary_max":  int(salary_max) if salary_max else None,
            "source":      "adzuna",
            "source_url":  raw_job.get("redirect_url", ""),
            "job_type":    "fulltime",
            "remote_ok":   "remote" in raw_job.get("title", "").lower(),
            "requirements": [],
        }