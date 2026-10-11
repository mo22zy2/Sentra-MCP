"""`sentra-mcp init`: one-command local setup for non-technical users.

Creates the course folder, merges the Sentra block into the user's
opencode.json (backing it up first, never deleting existing keys), and prints
what to do next in plain words. Never uploads anything anywhere.
"""

from __future__ import annotations

import datetime as _dt
import json
import os
import shutil
import sys
from pathlib import Path

from . import settings

CONFIG_FILENAME = "opencode.json"
BACKUP_PREFIX = "opencode.json.bak-"


class InitError(RuntimeError):
    """User-facing setup failure with a plain-words message."""


def default_course_dir() -> Path:
    docs = Path.home() / "Documents"
    base = docs if docs.is_dir() else Path.home()
    return base / "OS-Course"


def candidate_config_paths(explicit: str | None = None) -> list[Path]:
    if explicit:
        return [Path(explicit).expanduser()]
    paths = [Path.cwd() / CONFIG_FILENAME]
    xdg = os.getenv("XDG_CONFIG_HOME")
    if xdg:
        paths.append(Path(xdg) / "opencode" / CONFIG_FILENAME)
    paths.append(Path.home() / ".config" / "opencode" / CONFIG_FILENAME)
    if os.name == "nt" and os.getenv("APPDATA"):
        paths.append(Path(os.getenv("APPDATA")) / "opencode" / CONFIG_FILENAME)
    return paths


def default_new_config_path() -> Path:
    if os.name == "nt" and os.getenv("APPDATA"):
        return Path(os.getenv("APPDATA")) / "opencode" / CONFIG_FILENAME
    return Path.home() / ".config" / "opencode" / CONFIG_FILENAME


def find_existing_config(explicit: str | None = None) -> Path | None:
    for candidate in candidate_config_paths(explicit):
        if candidate.is_file():
            return candidate
    return None


def sentra_block(course_dir: Path) -> dict:
    return {
        "type": "local",
        "command": ["uvx", "sentra-mcp"],
        "environment": {"SENTRA_COURSE_DIR": str(course_dir)},
        "enabled": True,
        "timeout": 30000,
    }


def merge_config_file(config_path: Path, course_dir: Path) -> dict:
    """Merge the sentra block into config_path. Returns info about what happened."""
    backup_path: str | None = None
    if config_path.is_file():
        stamp = _dt.datetime.now().strftime("%Y%m%d-%H%M%S")
        backup_path = str(config_path.parent / f"{BACKUP_PREFIX}{stamp}")
        shutil.copy2(config_path, backup_path)
        try:
            raw = config_path.read_text(encoding="utf-8-sig")
            data = json.loads(raw) if raw.strip() else {}
        except json.JSONDecodeError as exc:
            raise InitError(
                f"Your OpenCode config at {config_path} is not valid JSON ({exc}). "
                f"A backup was saved at {backup_path}. Fix the file or delete it, then run init again."
            )
        if not isinstance(data, dict):
            raise InitError(
                f"Your OpenCode config at {config_path} is not a JSON object. "
                f"A backup was saved at {backup_path}. Fix it, then run init again."
            )
    else:
        data = {}
        config_path.parent.mkdir(parents=True, exist_ok=True)

    mcp = data.get("mcp")
    if mcp is None:
        mcp = {}
        data["mcp"] = mcp
    if not isinstance(mcp, dict):
        raise InitError(
            f'Your OpenCode config at {config_path} has an "mcp" key that is not an object. '
            + (f"A backup was saved at {backup_path}. " if backup_path else "")
            + "Fix it, then run init again."
        )
    mcp["sentra"] = sentra_block(course_dir)
    config_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return {"config_path": str(config_path), "backup_path": backup_path, "merged": True}


def create_course_tree(course_dir: Path) -> Path:
    for sub in (settings.LECTURES_SUBDIR, settings.PAST_EXAMS_SUBDIR, settings.OUTPUT_SUBDIR):
        (course_dir / sub).mkdir(parents=True, exist_ok=True)
    return course_dir


def run_init(course_dir: str | None = None, config: str | None = None) -> int:
    """Entry point for `sentra-mcp init`. Returns process exit code."""
    try:
        course = Path(course_dir).expanduser().resolve() if course_dir else default_course_dir().resolve()
        target = find_existing_config(config) or (Path(config).expanduser() if config else default_new_config_path())
        info = merge_config_file(target, course)
        create_course_tree(course)
    except InitError as exc:
        print(f"Setup stopped: {exc}", file=sys.stderr)
        return 1
    except OSError as exc:
        print(f"Setup stopped: cannot write files ({exc}).", file=sys.stderr)
        return 1

    print("Sentra is ready.")
    print(f"1. Course folder: {course}")
    print(f"   Put lecture PDFs in: {course / settings.LECTURES_SUBDIR}")
    print(f"   Put past exams in:   {course / settings.PAST_EXAMS_SUBDIR}")
    print(f"2. OpenCode config updated: {info['config_path']}")
    if info["backup_path"]:
        print(f"   Your previous config was backed up to: {info['backup_path']}")
    print("3. Open OpenCode, then ask: 'Analyze the previous exams and summarize the professor's question patterns.'")
    return 0
