"""Central settings: course dir, limits, safe defaults. No secrets here."""

from __future__ import annotations

import os
from pathlib import Path


def get_course_dir(explicit: str | None = None) -> Path:
    """Resolve the permitted course directory.

    Priority: explicit arg > SENTRA_COURSE_DIR env > current working directory.
    The folder opened in OpenCode IS the course folder: lectures/,
    past_exams/ and output/ live directly inside it and are auto-created.
    Always returns an absolute, resolved path.
    """
    raw = explicit or os.getenv("SENTRA_COURSE_DIR")
    if raw:
        return Path(raw).expanduser().resolve()
    return Path.cwd().resolve()


# Safety limits (tunable, documented in README).
MAX_PDF_BYTES = 50 * 1024 * 1024        # 50 MB per file
MAX_PAGES_PER_CALL = 50                 # extract cap per tool call
MAX_CHARS_PER_CALL = 60000              # char cap per extract call
MIN_CHARS_OK_PAGE = 50                  # below this -> insufficient_text
MAX_EXAM_MD_BYTES = 1 * 1024 * 1024     # 1 MB per exam/answer markdown
LECTURES_SUBDIR = "lectures"
PAST_EXAMS_SUBDIR = "past_exams"
OUTPUT_SUBDIR = "output"
