"""Exam spec validation (Pydantic) + generation brief builder."""

from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

from . import course_store, pdf_reader

ALLOWED_TYPES = {
    "MCQ", "True/False", "Short Answer", "Essay", "Numerical",
    "Comparison", "Diagram", "Case Study", "Application", "Analysis",
    "Problem Solving",
}


class DifficultyDist(BaseModel):
    easy: int = Field(ge=0, le=100)
    medium: int = Field(ge=0, le=100)
    hard: int = Field(ge=0, le=100)

    @model_validator(mode="after")
    def _sum_100(self):
        if self.easy + self.medium + self.hard != 100:
            raise ValueError("difficulty percentages must sum to 100.")
        return self


class ExamSpec(BaseModel):
    course_name: str = Field(min_length=1, max_length=200)
    duration_minutes: int = Field(ge=10, le=600)
    num_questions: int = Field(ge=1, le=100)
    question_types: list[str] = Field(min_length=1)
    difficulty: DifficultyDist
    topics: list[str] | None = None
    total_marks: int | None = Field(default=None, gt=0, le=1000)
    language: str = Field(default="English", min_length=1, max_length=50)

    @field_validator("question_types")
    @classmethod
    def _known_types(cls, v: list[str]) -> list[str]:
        bad = [t for t in v if t not in ALLOWED_TYPES]
        if bad:
            raise ValueError(f"Unknown question types: {bad}. Allowed: {sorted(ALLOWED_TYPES)}")
        return v

    @field_validator("topics")
    @classmethod
    def _topics_nonempty(cls, v: list[str] | None) -> list[str] | None:
        if v is not None:
            cleaned = [t.strip() for t in v if t.strip()]
            if len(cleaned) != len(v):
                raise ValueError("topics must not contain blank strings.")
            return cleaned
        return v


def _split_chunks(text: str, chunk_chars: int = 1500) -> list[str]:
    """Split page text into ~chunk-sized pieces on paragraph boundaries."""
    paras = [p.strip() for p in text.split("\n\n") if p.strip()]
    if not paras:
        return [text.strip()] if text.strip() else []
    chunks, current = [], ""
    for para in paras:
        if len(current) + len(para) + 2 <= chunk_chars:
            current = (current + "\n\n" + para).strip()
        else:
            if current:
                chunks.append(current)
            while len(para) > chunk_chars:
                chunks.append(para[:chunk_chars])
                para = para[chunk_chars:]
            current = para
    if current:
        chunks.append(current)
    return chunks


def collect_evidence(
    course_dir: Path,
    topics: list[str] | None,
    budget: int = 12000,
    chunk_chars: int = 1500,
    max_chunks_scanned: int = 400,
) -> tuple[list[dict], dict]:
    """Deep-scan every lecture PDF page for evidence.

    Unlike skimming openings, this walks ALL pages and fills the char budget
    with topic-matching chunks first, then earliest-unread general chunks.
    Returns (excerpts, coverage) where coverage maps each requested topic to
    the sorted file:page list where it was found (empty = unsupported).
    """
    wanted = [t.strip() for t in (topics or []) if t.strip()]
    scored: list[tuple[int, int, dict]] = []  # (topic_hits, doc_order, excerpt)
    coverage: dict[str, set] = {t: set() for t in wanted}
    order, scanned = 0, 0
    listing = course_store.discover_pdfs(course_dir)
    for entry in listing["lectures"]:
        try:
            target = course_store.resolve_inside(course_dir, entry["path"])
            probe = pdf_reader.extract_pages(target, page_start=1, page_end=1)
            total = probe["total_pages"]
        except Exception:
            continue
        start = 1
        while start <= total and scanned < max_chunks_scanned:
            end = min(start + 49, total)
            try:
                data = pdf_reader.extract_pages(target, page_start=start, page_end=end)
            except Exception:
                break
            for page in data["pages"]:
                for chunk in _split_chunks(page["text"], chunk_chars):
                    if len(chunk.strip()) < 50:
                        continue
                    low = chunk.lower()
                    hits = [t for t in wanted if t.lower() in low]
                    for t in hits:
                        coverage[t].add(f"{entry['path']}:p{page['page_no']}")
                    scored.append((len(hits), order, {
                        "file": entry["path"], "page": page["page_no"], "text": chunk,
                    }))
                    order += 1
                    scanned += 1
                    if scanned >= max_chunks_scanned:
                        break
                if scanned >= max_chunks_scanned:
                    break
            start = end + 1

    excerpts: list[dict] = []
    used = 0
    for hits, _, ex in sorted(scored, key=lambda item: (-item[0], item[1])):
        if used + len(ex["text"]) > budget:
            continue
        excerpts.append(ex)
        used += len(ex["text"])
        if used >= budget:
            break
    return excerpts, {t: sorted(pages) for t, pages in coverage.items()}


def style_signature(analysis: dict) -> list[str]:
    """Doctor style card: dominant types, templates, difficulty, marks habits
    as direct writer instructions. Same style, new content — never verbatim."""
    types = analysis.get("question_types", {}) or {}
    templates = analysis.get("templates", {}) or {}
    diff = analysis.get("difficulty_approx", {}) or {}
    marks = analysis.get("marks_distribution", {}) or {}
    top_types = sorted(types.items(), key=lambda kv: -kv[1])[:3]
    top_t = sorted(templates.items(), key=lambda kv: -kv[1])[:3]
    lines = ["## Doctor style card (match this voice and structure)"]
    if top_types:
        lines.append("- Question mix to mirror: " + ", ".join(f"{k} x{v}" for k, v in top_types) + ".")
    else:
        lines.append("- No question-type signal — use plain academic phrasing.")
    if top_t:
        lines.append("- Wording patterns to reuse with NEW content: " + ", ".join(f'"{k}" x{v}' for k, v in top_t) + ".")
    else:
        lines.append("- No recurring wording detected — use plain academic phrasing.")
    if diff:
        lines.append("- Difficulty feel: " + ", ".join(f"{k} {v}" for k, v in diff.items()) + ".")
    if marks.get("counted"):
        lines.append(f"- Marks habit: typically {marks.get('min')}-{marks.get('max')} per marked question; show marks on every question.")
    else:
        lines.append("- No marks found on past exams — omit marks unless the spec gives total_marks.")
    lines.append("- Never copy a past question verbatim; same style, new content, new numbers and examples.")
    return lines


def build_brief(
    spec: ExamSpec,
    lecture_excerpts: list[dict],
    analysis: dict,
    coverage: dict | None = None,
) -> dict:
    """Assemble the LLM brief: spec + evidence + style card + hard constraints."""
    lines = [
        f"# Mock exam brief: {spec.course_name}",
        "",
        f"- Duration: {spec.duration_minutes} minutes",
        f"- Questions: {spec.num_questions} ({', '.join(spec.question_types)})",
        f"- Difficulty: easy {spec.difficulty.easy}% / medium {spec.difficulty.medium}% / hard {spec.difficulty.hard}%",
        f"- Language: {spec.language}",
    ]
    if spec.total_marks:
        lines.append(f"- Total marks: {spec.total_marks}")
    if spec.topics:
        lines.append(f"- Requested topics: {', '.join(spec.topics)}")
    lines += [
        "",
        "## Style evidence (from past exams)",
        f"Question types observed: {analysis.get('question_types', {})}",
        f"Wording templates: {analysis.get('templates', {})}",
        f"Difficulty (approx): {analysis.get('difficulty_approx', {})}",
        f"Marks: {analysis.get('marks_distribution', {})}",
        "",
    ]
    lines += style_signature(analysis)
    lines += [
        "",
        "## Source excerpts (deep search — cite as filename:page)",
    ]
    for ex in lecture_excerpts:
        lines.append(f"### {ex['file']}:p{ex['page']}")
        lines.append(ex["text"][:1500])
        lines.append("")
    lines += [
        "## Hard constraints for the writer (OpenCode LLM)",
        "- Use lectures as the primary content source; past exams define style only.",
        "- Search the FULL excerpts, including later pages — key content often sits deep in the lectures, not in openings.",
        "- Mirror the Doctor style card above: same question mix, same wording patterns, same difficulty feel.",
        "- Cover every requested topic with at least one question.",
        "- Write ORIGINAL practice questions; do not copy past exams verbatim.",
        "- Every question must be answerable from the excerpts; cite source file:page.",
        "- No citation available for a question means [Uncertain] — never invent facts.",
        "- Keep the answer key in a SEPARATE file with explanations + source refs.",
        "- Student exam file must NOT contain answers. Answer key must be separate.",
        "- Include disclaimer: practice material only, cannot exactly predict the professor's next exam.",
    ]
    brief_md = "\n".join(lines)

    # Warn about requested topics missing from the FULL deep search.
    # coverage (from collect_evidence) outranks the excerpt budget: a topic
    # absent from excerpts but present in coverage is still groundable.
    warnings: list[str] = []
    if spec.topics:
        for t in spec.topics:
            found = (coverage or {}).get(t)
            if found:
                continue
            corpus = " ".join(e["text"] for e in lecture_excerpts).lower()
            if t.lower() not in corpus:
                warnings.append(
                    f"Requested topic '{t}' not found in the deep search of all lecture pages — "
                    "any question on it must be labeled [Uncertain] or omitted."
                )
    if not lecture_excerpts:
        warnings.append("No lecture excerpts available — cannot ground questions. Add PDFs to lectures/.")
    if not analysis.get("dataset", {}).get("questions_found"):
        warnings.append("No past-exam questions found — style guidance is weak; use generic academic style.")
    return {"brief_markdown": brief_md, "warnings": warnings}
