"""init: config merge preserves keys, backups, plain-words failures."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from sentra import init_cmd


def test_init_merges_without_deleting_keys(tmp_path: Path, monkeypatch):
    cfg = tmp_path / "opencode.json"
    cfg.write_text(json.dumps({
        "$schema": "https://opencode.ai/config.json",
        "mcp": {"other": {"type": "local", "command": ["x"]}},
        "tools": {"other_*": False},
    }), encoding="utf-8")
    course = tmp_path / "Course"
    rc = init_cmd.run_init(course_dir=str(course), config=str(cfg), )
    assert rc == 0
    data = json.loads(cfg.read_text(encoding="utf-8"))
    # pre-existing keys untouched
    assert data["mcp"]["other"] == {"type": "local", "command": ["x"]}
    assert data["tools"] == {"other_*": False}
    # sentra block added
    block = data["mcp"]["sentra"]
    assert block["command"] == ["uvx", "sentra-mcp"]
    assert block["environment"]["SENTRA_COURSE_DIR"] == str(course.resolve())
    assert block["enabled"] is True
    # backup exists
    backups = list(tmp_path.glob("opencode.json.bak-*"))
    assert len(backups) == 1
    # course tree created
    assert (course / "lectures").is_dir()
    assert (course / "past_exams").is_dir()
    assert (course / "output").is_dir()


def test_init_creates_missing_config(tmp_path: Path):
    cfg = tmp_path / "sub" / "opencode.json"
    course = tmp_path / "Course"
    assert init_cmd.run_init(course_dir=str(course), config=str(cfg)) == 0
    data = json.loads(cfg.read_text(encoding="utf-8"))
    assert data["mcp"]["sentra"]["type"] == "local"


def test_init_rejects_malformed_json(tmp_path: Path, capsys):
    cfg = tmp_path / "opencode.json"
    cfg.write_text("{ not json", encoding="utf-8")
    rc = init_cmd.run_init(course_dir=str(tmp_path / "C"), config=str(cfg))
    assert rc == 1
    assert "not valid JSON" in capsys.readouterr().err
    # backup still taken before failing
    assert len(list(tmp_path.glob("opencode.json.bak-*"))) == 1


def test_init_rejects_non_object_mcp(tmp_path: Path):
    cfg = tmp_path / "opencode.json"
    cfg.write_text(json.dumps({"mcp": ["nope"]}), encoding="utf-8")
    assert init_cmd.run_init(course_dir=str(tmp_path / "C"), config=str(cfg)) == 1
