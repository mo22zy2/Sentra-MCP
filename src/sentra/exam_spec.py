"""Exam spec validation (Pydantic) + generation brief builder."""

from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

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


def build_brief(spec: ExamSpec, lecture_excerpts: list[dict], analysis: dict) -> dict:
    """Assemble the LLM brief: spec + evidence + hard constraints."""
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
        "## Source excerpts (cite as filename:page)",
    ]
    for ex in lecture_excerpts:
        lines.append(f"### {ex['file']}:p{ex['page']}")
        lines.append(ex["text"][:1500])
        lines.append("")
    lines += [
        "## Hard constraints for the writer (OpenCode LLM)",
        "- Use lectures as the primary content source; past exams define style only.",
        "- Write ORIGINAL practice questions; do not copy past exams verbatim.",
        "- Every question must be answerable from the excerpts; cite source file:page.",
        "- Do not invent facts. Label uncertain/unsupported questions as [Uncertain].",
        "- Keep the answer key in a SEPARATE file with explanations + source refs.",
        "- Student exam file must NOT contain answers. Answer key must be separate.",
        "- Include disclaimer: practice material only, cannot exactly predict the professor's next exam.",
    ]
    brief_md = "\n".join(lines)

    # Warn about requested topics missing from excerpts.
    warnings: list[str] = []
    if spec.topics:
        corpus = " ".join(e["text"] for e in lecture_excerpts).lower()
        for t in spec.topics:
            if t.lower() not in corpus:
                warnings.append(
                    f"Requested topic '{t}' not found in lecture excerpts — "
                    "any question on it must be labeled [Uncertain] or omitted."
                )
    if not lecture_excerpts:
        warnings.append("No lecture excerpts available — cannot ground questions. Add PDFs to lectures/.")
    if not analysis.get("dataset", {}).get("questions_found"):
        warnings.append("No past-exam questions found — style guidance is weak; use generic academic style.")
    return {"brief_markdown": brief_md, "warnings": warnings}
