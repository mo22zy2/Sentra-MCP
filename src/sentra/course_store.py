"""Filesystem guardrails: stay inside the course dir, discover layout."""

from __future__ import annotations

from pathlib import Path

from . import settings


class CourseAccessError(ValueError):
    pass


def resolve_course_dir(explicit: str | None = None) -> Path:
    """Resolve the course dir, auto-creating it and its subfolders.

    The user never assigns paths: the opened folder is the course folder.
    Guardrails (traversal blocking, size caps) are unchanged.
    """
    course = settings.get_course_dir(explicit)
    try:
        course.mkdir(parents=True, exist_ok=True)
        for sub in (settings.LECTURES_SUBDIR, settings.PAST_EXAMS_SUBDIR, settings.OUTPUT_SUBDIR):
            (course / sub).mkdir(parents=True, exist_ok=True)
    except OSError as exc:
        raise CourseAccessError(
            f"Cannot use course directory {course}: {exc}."
        )
    return course


def resolve_inside(course_dir: Path, relative_path: str) -> Path:
    """Resolve a user-supplied relative path, blocking traversal/outside access."""
    if not relative_path or not relative_path.strip():
        raise CourseAccessError("relative_path must be a non-empty string.")
    # Reject absolute paths and null bytes upfront.
    if "\x00" in relative_path:
        raise CourseAccessError("Invalid path: null byte not allowed.")
    # Explicit absolute-path rejection (Windows drives, POSIX roots, ~).
    # (course_dir / absolute) would otherwise discard course_dir on some OSes;
    # containment still blocks it, but fail fast with a clear message.
    stripped = relative_path.strip()
    if Path(stripped).is_absolute() or stripped.startswith("~"):
        raise CourseAccessError(
            f"Access denied: '{relative_path}' must be relative to the course directory."
        )
    candidate = (course_dir / relative_path).resolve()
    try:
        candidate.relative_to(course_dir.resolve())
    except ValueError:
        raise CourseAccessError(
            f"Access denied: '{relative_path}' escapes the course directory."
        )
    return candidate


def ensure_output_dir(course_dir: Path) -> Path:
    out = course_dir / settings.OUTPUT_SUBDIR
    out.mkdir(parents=True, exist_ok=True)
    return out


def discover_pdfs(course_dir: Path) -> dict:
    """List PDFs under lectures/ and past_exams/. Never walks outside course_dir."""
    result: dict = {"lectures": [], "past_exams": [], "unreadable": []}
    resolved = course_dir.resolve()
    for key, sub in (
        ("lectures", settings.LECTURES_SUBDIR),
        ("past_exams", settings.PAST_EXAMS_SUBDIR),
    ):
        subdir = course_dir / sub
        if not subdir.is_dir():
            continue
        # Case-insensitive, symlink-safe: iterdir + suffix check instead of
        # case-sensitive glob("*.pdf"). Symlinks are skipped to avoid
        # leaking outside file existence/size via listing.
        for pdf in sorted(subdir.iterdir()):
            if not pdf.is_symlink() and pdf.is_file() and pdf.suffix.lower() == ".pdf":
                pass
            elif pdf.is_symlink():
                # Resolve symlink target; skip anything escaping course dir.
                try:
                    if pdf.resolve().relative_to(resolved) is not None:
                        pass
                except ValueError:
                    pass
                # Never list symlinks (even inside ones) to avoid oracle.
                continue
            else:
                continue
            try:
                size = pdf.stat().st_size
            except OSError as exc:
                result["unreadable"].append({"path": f"{sub}/{pdf.name}", "reason": str(exc)})
                continue
            if size == 0:
                result["unreadable"].append({"path": f"{sub}/{pdf.name}", "reason": "empty file (0 bytes)"})
                continue
            if size > settings.MAX_PDF_BYTES:
                result["unreadable"].append(
                    {"path": f"{sub}/{pdf.name}", "reason": f"exceeds {settings.MAX_PDF_BYTES} byte limit"}
                )
                continue
            result[key].append({"path": f"{sub}/{pdf.name}", "bytes": size})
    # Surface stray PDFs directly under root as unreadable-with-hint (don't require reorg,
    # but encourage lectures/ past_exams/ layout).
    try:
        for pdf in sorted(course_dir.iterdir()):
            if pdf.is_symlink():
                continue
            if pdf.is_file() and pdf.suffix.lower() == ".pdf":
                result["unreadable"].append(
                    {"path": pdf.name, "reason": "move into lectures/ or past_exams/"}
                )
    except OSError:
        pass
    return result
