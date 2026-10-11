"""Central settings: course dir, limits, safe defaults. No secrets here."""

from __future__ import annotations

import os
from pathlib import Path


def get_course_dir(explicit: str | None = None) -> Path:
    """Resolve the permitted course directory.

    Priority: explicit arg > SENTRA_COURSE_DIR env > ./OS-Course > cwd.
    Always returns an absolute, resolved path. Caller must ensure it exists.
    """
    raw = explicit or os.getenv("SENTRA_COURSE_DIR")
    if raw:
        return Path(raw).expanduser().resolve()
    default = Path.cwd() / "OS-Course"
    if default.is_dir():
        return default.resolve()
    return Path.cwd().resolve()


# Safety limits (tunable, documented in README).
MAX_PDF_BYTES = 50 * 1024 * 1024        # 50 MB per file
MAX_PAGES_PER_CALL = 50                 # extract cap per tool call
MAX_CHARS_PER_CALL = 60000              # char cap per extract call
MIN_CHARS_OK_PAGE = 50                  # below this -> insufficient_text
LECTURES_SUBDIR = "lectures"
PAST_EXAMS_SUBDIR = "past_exams"
OUTPUT_SUBDIR = "output"
