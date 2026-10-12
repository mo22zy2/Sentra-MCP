"""`sentra-mcp init`: one-command local setup for non-technical users.

Creates the course folder and registers Sentra with the chosen AI agent
(`--agent`, default: opencode) — backing up existing configs first, never
deleting existing keys — then prints what to do next in plain words.
Never uploads anything anywhere.
"""

from __future__ import annotations

import datetime as _dt
import copy
import json
import os
import shutil
import sys
from pathlib import Path

from . import agents, settings


class InitError(RuntimeError):
    """User-facing setup failure with a plain-words message."""


def _backup(config_path: Path) -> str:
    stamp = _dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = str(config_path.parent / f"{config_path.name}.bak-{stamp}")
    shutil.copy2(config_path, backup)
    return backup


def _load_json(config_path: Path, agent_name: str, backup_path: str | None) -> dict:
    try:
        raw = config_path.read_text(encoding="utf-8-sig")
        data = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError as exc:
        raise InitError(
            f"Your {agent_name} config at {config_path} is not valid JSON ({exc}). "
            + (f"A backup was saved at {backup_path}. " if backup_path else "")
            + "Fix the file or delete it, then run init again."
        )
    if not isinstance(data, dict):
        raise InitError(
            f"Your {agent_name} config at {config_path} is not a JSON object. "
            + (f"A backup was saved at {backup_path}. " if backup_path else "")
            + "Fix it, then run init again."
        )
    return data


def _load_existing_json(config_path: Path, agent_name: str) -> tuple[dict, str | None]:
    if not config_path.is_file():
        config_path.parent.mkdir(parents=True, exist_ok=True)
        return {}, None
    try:
        return _load_json(config_path, agent_name, None), None
    except InitError as exc:
        backup_path = _backup(config_path)
        raise InitError(f"{exc} A backup was saved at {backup_path}.")


def merge_file(agent_id: str, config_path: Path) -> dict:
    """Merge the sentra entry into config_path using the agent's own format."""
    spec = agents.AGENTS[agent_id]
    data, backup_path = _load_existing_json(config_path, spec["name"])
    before = copy.deepcopy(data)
    try:
        spec["merge"](data)
    except ValueError as exc:
        if config_path.is_file() and backup_path is None:
            backup_path = _backup(config_path)
        raise InitError(
            f"Cannot merge into {config_path}: {exc}. "
            + (f"A backup was saved at {backup_path}. " if backup_path else "")
            + "Fix it, then run init again."
        )
    if data == before:
        return {"config_path": str(config_path), "backup_path": None, "merged": False}
    if config_path.is_file() and backup_path is None:
        backup_path = _backup(config_path)
    config_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return {"config_path": str(config_path), "backup_path": backup_path, "merged": True}


# --- OpenCode path auto-detection (unchanged behavior) ---

OPENCODE_FILENAME = "opencode.json"


def candidate_config_paths(explicit: str | None = None) -> list[Path]:
    if explicit:
        return [Path(explicit).expanduser()]
    paths = [Path.cwd() / OPENCODE_FILENAME]
    xdg = os.getenv("XDG_CONFIG_HOME")
    if xdg:
        paths.append(Path(xdg) / "opencode" / OPENCODE_FILENAME)
    paths.append(Path.home() / ".config" / "opencode" / OPENCODE_FILENAME)
    if os.name == "nt" and os.getenv("APPDATA"):
        paths.append(Path(os.getenv("APPDATA")) / "opencode" / OPENCODE_FILENAME)
    return paths


def default_new_config_path() -> Path:
    if os.name == "nt" and os.getenv("APPDATA"):
        return Path(os.getenv("APPDATA")) / "opencode" / OPENCODE_FILENAME
    return Path.home() / ".config" / "opencode" / OPENCODE_FILENAME


def find_existing_config(explicit: str | None = None) -> Path | None:
    for candidate in candidate_config_paths(explicit):
        if candidate.is_file():
            return candidate
    return None


def opencode_block(course_dir: Path | None) -> dict:
    """No environment key by default: the server resolves the opened folder
    automatically, so the user assigns nothing."""
    block: dict = {
        "type": "local",
        "command": ["uvx", "sentra-mcp"],
        "enabled": True,
        "timeout": 30000,
    }
    if course_dir is not None:
        block["environment"] = {"SENTRA_COURSE_DIR": str(course_dir)}
    return block


def merge_opencode(config_path: Path, course_dir: Path | None) -> dict:
    """Legacy opencode merge (kept; same behavior as before)."""
    data, backup_path = _load_existing_json(config_path, "OpenCode")
    before = copy.deepcopy(data)
    node = data.get("mcp")
    if node is None:
        node = {}
        data["mcp"] = node
    if not isinstance(node, dict):
        if config_path.is_file() and backup_path is None:
            backup_path = _backup(config_path)
        raise InitError(
            f'Your OpenCode config at {config_path} has an "mcp" key that is not an object. '
            + (f"A backup was saved at {backup_path}. " if backup_path else "")
            + "Fix it, then run init again."
        )
    node["sentra"] = opencode_block(course_dir)
    if data == before:
        return {"config_path": str(config_path), "backup_path": None, "merged": False}
    if config_path.is_file() and backup_path is None:
        backup_path = _backup(config_path)
    config_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return {"config_path": str(config_path), "backup_path": backup_path, "merged": True}


# Backward-compatible alias used by older callers/tests.
def merge_config_file(config_path: Path, course_dir: Path | None) -> dict:
    return merge_opencode(config_path, course_dir)


def sentra_block(course_dir: Path | None) -> dict:
    return opencode_block(course_dir)


def create_course_tree(course_dir: Path) -> Path:
    for sub in (settings.LECTURES_SUBDIR, settings.PAST_EXAMS_SUBDIR, settings.OUTPUT_SUBDIR):
        (course_dir / sub).mkdir(parents=True, exist_ok=True)
    return course_dir


def resolve_target(agent_id: str, course: Path, config: str | None) -> Path:
    """Where to write the agent's config: explicit --config wins; project
    agents write into the course folder; global agents use their home path;
    opencode auto-detects (legacy behavior)."""
    if config:
        return Path(config).expanduser()
    if agent_id == "opencode":
        return find_existing_config(None) or default_new_config_path()
    spec = agents.AGENTS[agent_id]
    if spec["kind"] == "project":
        return agents.project_file(agent_id, course)
    return agents.global_file(agent_id)


def run_init(
    course_dir: str | None = None,
    config: str | None = None,
    agent: str = "opencode",
) -> int:
    """Entry point for `sentra-mcp init`. Returns process exit code.

    Default (no args): the current folder becomes the course folder —
    lectures/, past_exams/ and output/ are created in it and no paths are
    written anywhere. Only --course-dir writes SENTRA_COURSE_DIR (opencode).
    """
    if agent not in agents.AGENTS:
        print(
            f"Unknown agent '{agent}'. Choose one of: {', '.join(agents.AGENT_IDS)}.",
            file=sys.stderr,
        )
        return 1
    try:
        if course_dir:
            course = Path(course_dir).expanduser().resolve()
            env_course: Path | None = course
        else:
            course = Path.cwd().resolve()
            env_course = None
        target = resolve_target(agent, course, config)
        if agent == "opencode":
            info = merge_opencode(target, env_course)
        else:
            info = merge_file(agent, target)
        create_course_tree(course)
    except InitError as exc:
        print(f"Setup stopped: {exc}", file=sys.stderr)
        return 1
    except OSError as exc:
        print(f"Setup stopped: cannot write files ({exc}).", file=sys.stderr)
        return 1

    spec = agents.AGENTS[agent]
    print("Sentra is ready.")
    print(f"1. Course folder: {course}")
    print(f"   Put lecture PDFs in: {course / settings.LECTURES_SUBDIR}")
    print(f"   Put past exams in:   {course / settings.PAST_EXAMS_SUBDIR}")
    print(f"2. {spec['name']} config updated: {info['config_path']}")
    if info["backup_path"]:
        print(f"   Your previous config was backed up to: {info['backup_path']}")
    print(f"3. {spec['hint']}")
    print("4. Then ask: 'Run the sentra pipeline.' (prompts-first: knowledge_base → professor_dna → exam_targets → predicted_exam, saved under output/)")
    print("   Or ask for mock exams: 'Make me 2 exams using the sentra mcp.'")
    return 0
