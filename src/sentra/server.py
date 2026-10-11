"""Sentra MCP server (stdio). Document extraction + file ops; LLM reasons client-side."""

from __future__ import annotations

from typing import Annotated

from mcp.server import MCPServer
from pydantic import Field

from . import analysis_prep, course_store, exam_files, exam_spec, pdf_reader, settings

mcp = MCPServer("sentra")


@mcp.tool()
def list_course_pdfs(
    course_dir: Annotated[
        str | None,
        Field(description="Optional absolute course dir override. Defaults to SENTRA_COURSE_DIR / ./OS-Course / cwd."),
    ] = None,
) -> dict:
    """List lecture and past-exam PDFs in the course directory.

    Distinguishes lectures/ from past_exams/, reports unreadable files.
    Never accesses files outside the permitted course directory.
    """
    course = course_store.resolve_course_dir(course_dir)
    listing = course_store.discover_pdfs(course)
    return {
        "course_dir": str(course),
        "lectures": listing["lectures"],
        "past_exams": listing["past_exams"],
        "unreadable": listing["unreadable"],
    }


@mcp.tool()
def extract_pdf_text(
    relative_path: Annotated[str, Field(description="Path relative to course dir, e.g. 'lectures/lecture_01.pdf'.")],
    page_start: Annotated[int, Field(description="1-based first page.", ge=1)] = 1,
    page_end: Annotated[int | None, Field(description="1-based last page inclusive. Defaults to end (capped).")] = None,
    course_dir: Annotated[str | None, Field(description="Optional course dir override.")] = None,
) -> dict:
    """Extract text from one PDF, preserving page numbers and filename refs.

    Streams only the requested page window (max 50 pages / 60000 chars per call).
    Reports corrupt files and insufficient-text (scanned) files instead of
    returning silent empty content. No OCR in MVP.
    """
    course = course_store.resolve_course_dir(course_dir)
    target = course_store.resolve_inside(course, relative_path)
    if target.suffix.lower() != ".pdf":
        raise ValueError(f"Unsupported file type '{target.suffix}'. Only .pdf is supported in MVP.")
    if not target.is_file():
        raise ValueError(f"File not found inside course dir: '{relative_path}'.")
    result = pdf_reader.extract_pages(target, page_start=page_start, page_end=page_end)
    result["relative_path"] = relative_path
    return result


@mcp.tool()
def analyze_past_exams(
    course_dir: Annotated[str | None, Field(description="Optional course dir override.")] = None,
) -> dict:
    """Analyze past exams for question types, templates, difficulty, marks.

    Heuristic, deterministic prep for the AI client. Every finding cites
    source filenames + page numbers. Past patterns only — never claims to
    exactly predict the professor's next exam.
    """
    course = course_store.resolve_course_dir(course_dir)
    return analysis_prep.analyze_course(course)


@mcp.tool()
def prepare_exam_brief(
    spec: Annotated[dict, Field(description="Exam spec: course_name, duration_minutes, num_questions, question_types[], difficulty{easy,medium,hard}, topics?, total_marks?, language?.")],
    course_dir: Annotated[str | None, Field(description="Optional course dir override.")] = None,
) -> dict:
    """Validate an exam spec and build a grounded generation brief for the AI client.

    Returns brief_markdown (spec + style evidence + lecture excerpts with
    file:page refs + writer constraints) plus warnings for unsupported topics.
    The MCP server does not call any model; OpenCode writes the questions.
    """
    course = course_store.resolve_course_dir(course_dir)
    parsed = exam_spec.ExamSpec.model_validate(spec)
    # Gather lecture excerpts within a char budget (token-limit friendly).
    listing = course_store.discover_pdfs(course)
    excerpts: list[dict] = []
    budget = 12000
    for entry in listing["lectures"]:
        if budget <= 0:
            break
        target = course_store.resolve_inside(course, entry["path"])
        try:
            data = pdf_reader.extract_pages(target, page_start=1, page_end=2)
        except Exception:
            continue
        for page in data["pages"]:
            text = page["text"].strip()
            if len(text) < 50:
                continue
            chunk = text[:2000]
            excerpts.append({"file": entry["path"], "page": page["page_no"], "text": chunk})
            budget -= len(chunk)
            if budget <= 0:
                break
    analysis = analysis_prep.analyze_course(course)
    return exam_spec.build_brief(parsed, excerpts, analysis)


@mcp.tool()
def save_exam_files(
    exam_markdown: Annotated[str, Field(description="Student-facing exam markdown (no answers).")],
    answer_key_markdown: Annotated[str, Field(description="Separate answer key with explanations + source refs.")],
    basename: Annotated[str, Field(description="Safe name, e.g. 'os_midterm_mock1'. Creates output/<basename>_exam.md + _answers.md.")],
    overwrite: Annotated[bool, Field(description="Must be true to replace existing files.")] = False,
    course_dir: Annotated[str | None, Field(description="Optional course dir override.")] = None,
) -> dict:
    """Validate separation and save exam + answer key under output/.

    Predictable filenames, no silent overwrite, paths stay inside the course dir.
    """
    course = course_store.resolve_course_dir(course_dir)
    return exam_files.save_pair(course, exam_markdown, answer_key_markdown, basename, overwrite)


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
