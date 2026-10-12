"""Schemaless pipeline file saver.

The prompts define the file structure — code does NOT validate content.
Only safety guardrails: filename allowlist, size cap, stay-inside-course-dir,
no silent overwrite. The agent infers structure from the prompt text itself.
"""

from __future__ import annotations

from pathlib import Path

from . import course_store, settings, workflow_prompts


class PipelineFileError(ValueError):
    pass


def save_pipeline_markdown(
    course_dir: Path,
    filename: str,
    markdown: str,
    overwrite: bool = False,
) -> dict:
    """Save one pipeline markdown file (knowledge_base.md, etc.).

    No content-schema checks: any non-empty markdown the agent produced
    from the corresponding prompt is accepted.
    """
    if filename not in workflow_prompts.PIPELINE_OUTPUTS:
        raise PipelineFileError(
            f"Unknown pipeline file '{filename}'. "
            f"Choose one of: {', '.join(workflow_prompts.PIPELINE_OUTPUTS)}."
        )
    if not markdown or not markdown.strip():
        raise PipelineFileError(f"Refusing to save empty '{filename}'.")
    if len(markdown.encode("utf-8")) > settings.MAX_EXAM_MD_BYTES:
        raise PipelineFileError(
            f"'{filename}' exceeds {settings.MAX_EXAM_MD_BYTES} byte limit."
        )
    outdir = course_store.ensure_output_dir(course_dir)
    target = outdir / filename
    try:
        target.resolve().relative_to(course_dir.resolve())
    except ValueError:
        raise PipelineFileError(f"Output path escapes course dir: {target}")
    if not overwrite and target.exists():
        raise PipelineFileError(
            f"Refusing to overwrite existing '{target.name}'. "
            "Choose overwrite=true explicitly to replace it."
        )
    target.write_text(markdown, encoding="utf-8")
    return {
        "path": f"{settings.OUTPUT_SUBDIR}/{target.name}",
        "bytes": len(markdown.encode("utf-8")),
    }
