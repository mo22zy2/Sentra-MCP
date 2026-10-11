"""Heuristic past-exam analysis. Deterministic prep for the LLM — no inference here."""

from __future__ import annotations

import re
from collections import Counter
from pathlib import Path

from . import course_store, pdf_reader, settings

DISCLAIMER = (
    "This analysis describes past patterns only. "
    "It cannot exactly predict the professor's next exam."
)

# Question splitter: Q1, Q1., Q1), Question 1, 1.
Q_SPLIT = re.compile(r"(?im)^\s*(?:question\s*)?(?:Q\s*)?(\d{1,3})\s*(?:[.\)\:\-]\s*|\s+)")
MARKS = re.compile(r"[(\[]\s*(\d{1,3})\s*(?:marks?|pts?|points?)\s*[)\]]|(\d{1,3})\s*marks?", re.IGNORECASE)
MCQ_LABELS = re.compile(r"(?m)^\s*(?:[A-Da-d1-4]\s*[\)\.\:\-])\s+\S+")

TEMPLATES = [
    ("Define X", re.compile(r"^\s*define\s+\S+", re.IGNORECASE)),
    ("What is X?", re.compile(r"what\s+is\s+(?:the\s+)?(?:purpose|meaning|definition)\b|^\s*what\s+is\b", re.IGNORECASE)),
    ("Compare X and Y", re.compile(r"\bcompare\b|\bversus\b|\bvs\b", re.IGNORECASE)),
    ("Which of the following", re.compile(r"which\s+of\s+the\s+following", re.IGNORECASE)),
    ("Calculate", re.compile(r"\bcalculat\w*\b|\bcompute\b|\bdetermine\s+(?:the\s+)?value\b", re.IGNORECASE)),
    ("Explain why / What happens if", re.compile(r"^\s*why\b|what\s+happens\s+if|explain\s+why", re.IGNORECASE)),
    ("True/False", re.compile(r"\btrue\s*/\s*false\b|\btrue\s+or\s+false\b", re.IGNORECASE)),
]

HARD_HINTS = re.compile(r"\banaly[sz]e\b|\bcompare\b|\bintegrat\w*\b|\bscenario\b|\bmulti-step\b|\bjustify\b|\bdesign\b", re.IGNORECASE)
EASY_HINTS = re.compile(r"^\s*define\b|\brecall\b|\blist\b|\bname\b|\bwhat\s+is\b", re.IGNORECASE)

STOPWORDS = {
    "the", "and", "for", "with", "from", "that", "this", "which", "what", "when",
    "define", "explain", "compare", "calculate", "following", "question", "marks",
    "mark", "points", "true", "false", "each", "using", "used", "into", "between",
}


def _classify_type(qtext: str) -> str:
    t = qtext.strip()
    if MCQ_LABELS.search(t) or "which of the following" in t.lower():
        return "MCQ"
    if re.search(r"\btrue\s*/\s*false\b|\btrue\s+or\s+false\b", t, re.IGNORECASE):
        return "True/False"
    if re.search(r"\bcalculat\w*\b|\bcompute\b", t, re.IGNORECASE):
        return "Numerical"
    if re.search(r"\bcompare\b|\bvs\b|\bversus\b", t, re.IGNORECASE):
        return "Comparison"
    if re.search(r"^\s*define\b", t, re.IGNORECASE):
        return "Short Answer"
    if len(t) > 300:
        return "Essay/Analysis"
    return "Short Answer"


def _guess_difficulty(qtext: str) -> str:
    if HARD_HINTS.search(qtext):
        return "Hard (approx)"
    if EASY_HINTS.search(qtext):
        return "Easy (approx)"
    return "Medium (approx)"


def analyze_course(course_dir: Path, max_pages_per_exam: int = 50) -> dict:
    listing = course_store.discover_pdfs(course_dir)
    exam_files = listing["past_exams"]
    lecture_files = [e["path"] for e in listing["lectures"]]

    questions: list[dict] = []
    templates: Counter = Counter()
    types: Counter = Counter()
    difficulties: Counter = Counter()
    marks: list[int] = []
    topic_counter: Counter = Counter()
    per_exam_counts: list[dict] = []

    for entry in exam_files:
        rel = entry["path"]
        target = course_store.resolve_inside(course_dir, rel)
        try:
            data = pdf_reader.extract_pages(target, page_start=1, page_end=max_pages_per_exam)
        except Exception as exc:
            per_exam_counts.append({"file": rel, "error": str(exc)})
            continue
        # Split into questions using numbering; keep page refs.
        chunks: list[tuple[int, str]] = []  # (page_no, qtext)
        for page in data["pages"]:
            parts = Q_SPLIT.split(page["text"])
            # split() with capture group: [pre, num1, text1, num2, text2, ...]
            if len(parts) >= 3:
                for idx in range(1, len(parts), 2):
                    num = parts[idx]
                    body = parts[idx + 1] if idx + 1 < len(parts) else ""
                    chunks.append((page["page_no"], f"Q{num} {body.strip()}"))
            elif page["text"].strip():
                chunks.append((page["page_no"], page["text"].strip()[:2000]))

        per_exam_counts.append({"file": rel, "questions_found": len(chunks), "pages": data["total_pages"]})
        for page_no, qtext in chunks:
            qtype = _classify_type(qtext)
            diff = _guess_difficulty(qtext)
            types[qtype] += 1
            difficulties[diff] += 1
            m = MARKS.search(qtext)
            mark_val = None
            if m:
                mark_val = int(next(g for g in m.groups() if g is not None))
                marks.append(mark_val)
            for name, rx in TEMPLATES:
                if rx.search(qtext):
                    templates[name] += 1
                    break
            words = re.findall(r"[A-Za-z][A-Za-z\-]{3,}", qtext.lower())
            for w in words:
                if w not in STOPWORDS:
                    topic_counter[w] += 1
            questions.append({
                "file": rel, "page": page_no, "type": qtype,
                "difficulty": diff, "marks": mark_val,
                "preview": qtext[:200],
            })

    total = len(questions)
    findings: list[dict] = []
    if total:
        top_types = types.most_common(3)
        src = [f"{q['file']}:p{q['page']}" for q in questions[:3]]
        findings.append({
            "claim": f"Most common question types: {', '.join(f'{k} x{v}' for k, v in top_types)}.",
            "sources": src,
        })
        if templates:
            top_t = templates.most_common(3)
            # cite one example per template
            tsources = []
            for name, _ in top_t:
                for q in questions:
                    tsources.append(f"{q['file']}:p{q['page']}")
                    break
            findings.append({
                "claim": f"Recurring wording patterns: {', '.join(f'{k} x{v}' for k, v in top_t)}.",
                "sources": tsources[:3],
            })
        if marks:
            findings.append({
                "claim": f"Marks per question range {min(marks)}-{max(marks)}, total observed {sum(marks)} across {len(marks)} marked questions.",
                "sources": [f"{q['file']}:p{q['page']}" for q in questions if q["marks"]][:3],
            })
        top_topics = [w for w, _ in topic_counter.most_common(10)]
        if top_topics:
            findings.append({
                "claim": f"Frequent content words (topic hints, verify against lectures): {', '.join(top_topics[:8])}.",
                "sources": [f"{q['file']}:p{q['page']}" for q in questions[:3]],
            })

    return {
        "disclaimer": DISCLAIMER,
        "dataset": {
            "exams_analyzed": len(exam_files),
            "exam_files": [e["path"] for e in exam_files],
            "lecture_files": lecture_files,
            "questions_found": total,
            "per_exam": per_exam_counts,
        },
        "question_types": dict(types),
        "difficulty_approx": dict(difficulties),
        "marks_distribution": {
            "counted": len(marks),
            "min": min(marks) if marks else None,
            "max": max(marks) if marks else None,
            "total_observed": sum(marks) if marks else 0,
        },
        "templates": dict(templates),
        "recurring_words": dict(topic_counter.most_common(20)),
        "lecture_topics_covered_by": lecture_files,
        "findings": findings,
        "unreadable": listing["unreadable"],
    }
