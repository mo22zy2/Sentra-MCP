"""Safe local output: validate separation, predictable names, no silent overwrite."""

from __future__ import annotations

import re
from pathlib import Path

from . import course_store, settings

BASENAME_RX = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_\-]{0,63}$")


class ExamFileError(ValueError):
    pass


def sanitize_basename(basename: str) -> str:
    if not BASENAME_RX.match(basename or ""):
        raise ExamFileError(
            "basename must be 1-64 chars: letters, digits, '_' or '-', starting alphanumeric "
            "(e.g. 'os_midterm_mock1')."
        )
    return basename


def validate_pair(exam_markdown: str, answer_key_markdown: str) -> list[str]:
    """Return warnings (empty = clean). Raise on hard separation violations."""
    if not exam_markdown or len(exam_markdown.strip()) < 50:
        raise ExamFileError("exam_markdown is too short (<50 chars). Generate real questions first.")
    if not answer_key_markdown or len(answer_key_markdown.strip()) < 50:
        raise ExamFileError("answer_key_markdown is too short (<50 chars).")
    if "answer key" in exam_markdown.lower():
        raise ExamFileError(
            "Separation violation: student exam file must NOT contain an answer key. "
            "Keep answers in the separate answer-key file."
        )
    warnings: list[str] = []
    if "answer" not in answer_key_markdown.lower():
        warnings.append("Answer key does not mention 'answer' — check it actually contains answers.")
    if "uncertain" not in (exam_markdown + answer_key_markdown).lower():
        warnings.append(
            "No [Uncertain] labels found. If all questions are grounded this is fine; "
            "otherwise label unsupported questions."
        )
    if "predict" in exam_markdown.lower() and "cannot" not in exam_markdown.lower():
        warnings.append("Exam mentions prediction without the required disclaimer — add it.")
    return warnings


def save_pair(
    course_dir: Path,
    exam_markdown: str,
    answer_key_markdown: str,
    basename: str,
    overwrite: bool = False,
) -> dict:
    basename = sanitize_basename(basename)
    warnings = validate_pair(exam_markdown, answer_key_markdown)
    outdir = course_store.ensure_output_dir(course_dir)
    exam_path = outdir / f"{basename}_exam.md"
    key_path = outdir / f"{basename}_answers.md"
    # Belt-and-braces: both must stay inside course dir.
    for p in (exam_path, key_path):
        try:
            p.resolve().relative_to(course_dir.resolve())
        except ValueError:
            raise ExamFileError(f"Output path escapes course dir: {p}")
    if not overwrite and (exam_path.exists() or key_path.exists()):
        existing = [str(p) for p in (exam_path, key_path) if p.exists()]
        raise ExamFileError(
            f"Refusing to overwrite existing files: {existing}. "
            "Choose a new basename or pass overwrite=true explicitly."
        )
    exam_path.write_text(exam_markdown, encoding="utf-8")
    key_path.write_text(answer_key_markdown, encoding="utf-8")
    return {
        "exam_path": f"{settings.OUTPUT_SUBDIR}/{exam_path.name}",
        "answer_key_path": f"{settings.OUTPUT_SUBDIR}/{key_path.name}",
        "warnings": warnings,
    }
