"""Prompts-first workflow: serve the user's pipeline prompts verbatim.

The user's `prompts/*.md` files ARE the core. Tools only supply evidence.
No schema is enforced on prompt output — the prompt text itself defines
the file structure; the agent infers it and writes free-form markdown.

Loader reads from the packaged `src/sentra/prompts/` dir (ships in the
wheel for `uvx`), falling back to repo-root `prompts/` in source checkout.
"""

from __future__ import annotations

from pathlib import Path

# Canonical order: each step's `writes` is the file the prompt asks for.
PIPELINE_ORDER: list[str] = [
    "extract_text",
    "knowledge_base",
    "professor_dna",
    "exam_targets",
    "predicted_exam",
]

_FILES: dict[str, str] = {
    "extract_text": "Extracting_Text_from_PDF.md",
    "knowledge_base": "knowledge_base_prompt.md",
    "professor_dna": "professor_dna_prompt.md",
    "exam_targets": "exam_targets_prompt.md",
    "predicted_exam": "predicted_exam_prompt.md",
}

_WRITES: dict[str, str | None] = {
    "extract_text": None,  # guidance only; extraction happens via extract_pdf_text
    "knowledge_base": "knowledge_base.md",
    "professor_dna": "professor_dna.md",
    "exam_targets": "exam_targets.md",
    "predicted_exam": "predicted_exam.md",
}

_DESCRIBE: dict[str, str] = {
    "extract_text": "Step 1: how to read every PDF faithfully before anything else.",
    "knowledge_base": "Step 2: build knowledge_base.md from lectures (complete, not summary).",
    "professor_dna": "Step 3: build professor_dna.md from past exams (behavior model).",
    "exam_targets": "Step 4: build exam_targets.md from knowledge_base + professor_dna.",
    "predicted_exam": "Step 5: build predicted_exam.md from the three files above.",
}

# Files the schemaless saver accepts (prompt-defined structure, no validation).
PIPELINE_OUTPUTS: tuple[str, ...] = (
    "knowledge_base.md",
    "professor_dna.md",
    "exam_targets.md",
    "predicted_exam.md",
)

_PACKAGE_DIR = Path(__file__).resolve().parent / "prompts"
_REPO_FALLBACK_DIR = Path(__file__).resolve().parents[2] / "prompts"


class UnknownPromptError(ValueError):
    pass


def _resolve_file(name: str) -> Path:
    filename = _FILES.get(name)
    if filename is None:
        raise UnknownPromptError(
            f"Unknown prompt '{name}'. Choose one of: {', '.join(PIPELINE_ORDER)}."
        )
    packaged = _PACKAGE_DIR / filename
    if packaged.is_file():
        return packaged
    fallback = _REPO_FALLBACK_DIR / filename
    if fallback.is_file():
        return fallback
    raise UnknownPromptError(
        f"Prompt file '{filename}' not found in packaged prompts or repo prompts/."
    )


def get_prompt_text(name: str) -> str:
    """Return the prompt markdown verbatim — never templated, never schema-wrapped."""
    if not name or not name.strip() or name.strip() != name or "/" in name or "\\" in name:
        raise UnknownPromptError(
            f"Unknown prompt '{name}'. Choose one of: {', '.join(PIPELINE_ORDER)}."
        )
    path = _resolve_file(name)
    try:
        return path.read_text(encoding="utf-8")
    except OSError as exc:
        raise UnknownPromptError(f"Cannot read prompt '{name}': {exc}")


def next_step(name: str) -> str | None:
    try:
        idx = PIPELINE_ORDER.index(name)
    except ValueError:
        return None
    if idx + 1 < len(PIPELINE_ORDER):
        return PIPELINE_ORDER[idx + 1]
    return None


def describe_pipeline() -> list[dict]:
    return [
        {"name": n, "writes": _WRITES[n], "description": _DESCRIBE[n]}
        for n in PIPELINE_ORDER
    ]
