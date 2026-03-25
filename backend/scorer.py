"""
scorer.py — ATS friendliness scoring (rule-based + LLM)
Score breakdown: sections(25) + keywords(35) + formatting(20) + length(10) + clarity(10)
"""
import re
import json
from openai import OpenAI
from config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

REQUIRED_SECTIONS = ["experience", "education", "skills", "summary"]
PENALISED_CHARS   = ["•", "●", "◆", "★", "→"]  # fancy bullets ATS can't parse
TABLE_PATTERN     = re.compile(r"\|.*\|")
COLUMNS_PATTERN   = re.compile(r"(.{1,60}\s{4,}.{1,60}){3,}")  # multi-col layout

ATS_PROMPT = """Rate this resume text for ATS clarity. Return JSON only:
{
  "keyword_density": 0-35,   // how well keywords stand out
  "clarity_score":  0-10,    // sentence structure
  "issues": ["string"]       // top 3 plain-English issues
}
Resume:
"""


class ATSScorer:

    def score(self, raw_text: str, parsed_data: dict, jd_keywords: list[str] = None) -> dict:
        section_score  = self._score_sections(parsed_data)
        format_score   = self._score_format(raw_text)
        length_score   = self._score_length(raw_text)
        llm_result     = self._llm_score(raw_text)

        keyword_score  = llm_result.get("keyword_density", 20)
        clarity_score  = llm_result.get("clarity_score", 7)

        total = section_score + keyword_score + format_score + length_score + clarity_score

        return {
            "score": round(min(total, 100), 1),
            "breakdown": {
                "sections":  section_score,
                "keywords":  keyword_score,
                "format":    format_score,
                "length":    length_score,
                "clarity":   clarity_score,
            },
            "issues":           llm_result.get("issues", []) + self._format_issues(raw_text),
            "missing_sections": self._missing_sections(parsed_data),
        }

    # ── Rules ──────────────────────────────────────────────────────────────

    def _score_sections(self, parsed: dict) -> float:
        """25 pts — 5 pts per required section present"""
        present = 0
        if parsed.get("experience"):  present += 1
        if parsed.get("education"):   present += 1
        if parsed.get("skills"):      present += 1
        if parsed.get("name"):        present += 1
        if parsed.get("email"):       present += 1
        return present * 5

    def _score_format(self, text: str) -> float:
        """20 pts — deduct for ATS-breaking formatting"""
        score = 20
        if TABLE_PATTERN.search(text):    score -= 8
        if COLUMNS_PATTERN.search(text):  score -= 6
        for ch in PENALISED_CHARS:
            if text.count(ch) > 5:        score -= 2; break
        return max(score, 0)

    def _score_length(self, text: str) -> float:
        """10 pts — ideal 400–900 words"""
        words = len(text.split())
        if 400 <= words <= 900:  return 10
        if 300 <= words < 400:   return 7
        if 900 < words <= 1200:  return 7
        return 4

    def _missing_sections(self, parsed: dict) -> list[str]:
        missing = []
        if not parsed.get("experience"):  missing.append("Work Experience")
        if not parsed.get("education"):   missing.append("Education")
        if not parsed.get("skills"):      missing.append("Skills")
        if not parsed.get("summary"):     missing.append("Summary / Objective")
        return missing

    def _format_issues(self, text: str) -> list[str]:
        issues = []
        if TABLE_PATTERN.search(text):
            issues.append("Tables detected — most ATS systems cannot parse table content")
        if COLUMNS_PATTERN.search(text):
            issues.append("Multi-column layout detected — ATS reads left-to-right, may scramble order")
        return issues

    # ── LLM ───────────────────────────────────────────────────────────────

    def _llm_score(self, text: str) -> dict:
        try:
            resp = client.chat.completions.create(
                model=settings.LLM_MODEL,
                messages=[{"role": "user", "content": ATS_PROMPT + text[:4000]}],
                response_format={"type": "json_object"},
                temperature=0,
            )
            return json.loads(resp.choices[0].message.content)
        except Exception:
            return {"keyword_density": 20, "clarity_score": 7, "issues": []}