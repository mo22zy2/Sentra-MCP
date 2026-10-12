"""init: config merge preserves keys, backups, plain-words failures."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from sentra import agents, init_cmd


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
    # sentra block added; explicit course dir is recorded, nothing hardcoded by default
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


def test_init_explicit_course_dir_writes_env(tmp_path: Path):
    cfg = tmp_path / "opencode.json"
    course = tmp_path / "MyPhysics"
    assert init_cmd.run_init(course_dir=str(course), config=str(cfg)) == 0
    data = json.loads(cfg.read_text(encoding="utf-8"))
    assert data["mcp"]["sentra"]["environment"]["SENTRA_COURSE_DIR"] == str(course.resolve())
    assert (course / "lectures").is_dir()


def test_init_default_uses_cwd_without_env(tmp_path: Path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    cfg = tmp_path / "opencode.json"
    assert init_cmd.run_init(config=str(cfg)) == 0
    data = json.loads(cfg.read_text(encoding="utf-8"))
    assert "environment" not in data["mcp"]["sentra"]
    assert (tmp_path / "lectures").is_dir()
    assert (tmp_path / "past_exams").is_dir()
    assert (tmp_path / "output").is_dir()


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


@pytest.mark.parametrize("agent_id", list(agents.AGENT_IDS))
def test_init_every_agent_shape(tmp_path: Path, monkeypatch, agent_id: str):
    """Every supported agent gets a correct, minimal entry; existing keys survive."""
    monkeypatch.chdir(tmp_path)
    course = tmp_path / "Course"
    if agents.AGENTS[agent_id]["kind"] == "project":
        target = course / agents.AGENTS[agent_id]["filename"]
    else:
        target = tmp_path / f"{agent_id}-config.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps({"existing": {"keep": True}}), encoding="utf-8")
    rc = init_cmd.run_init(course_dir=str(course), config=str(target), agent=agent_id)
    assert rc == 0
    data = json.loads(target.read_text(encoding="utf-8"))
    assert data["existing"] == {"keep": True}
    root = {"opencode": "mcp", "vscode": "servers"}.get(agent_id, "mcpServers")
    entry = data[root]["sentra"]
    if agent_id == "opencode":
        assert entry["command"] == ["uvx", "sentra-mcp"]
    else:
        assert entry["command"] == "uvx"
        assert entry["args"] == ["sentra-mcp"]
    # second run backs up, never duplicates/corrupts
    assert init_cmd.run_init(course_dir=str(course), config=str(target), agent=agent_id) == 0
    assert len(list(target.parent.glob(f"{target.name}.bak-*"))) == 1


def test_init_rejects_unknown_agent(tmp_path: Path, capsys):
    assert init_cmd.run_init(config=str(tmp_path / "c.json"), agent="notepad") == 1
    assert "Unknown agent" in capsys.readouterr().err
