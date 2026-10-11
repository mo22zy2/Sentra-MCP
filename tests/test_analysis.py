"""Past-exam analysis: structure, citations, disclaimer."""

from __future__ import annotations

import json

import anyio
import pytest

from mcp import Client

from sentra import analysis_prep, course_store
from sentra.server import mcp


def _payload(result) -> dict:
    return json.loads(result.content[0].text)  # type: ignore[attr-defined]


def test_analyze_tool_registered():
    async def _list():
        async with Client(mcp) as client:
            res = await client.list_tools()
            return [t.name for t in res.tools]

    assert "analyze_past_exams" in anyio.run(_list)


def test_analyze_finds_types_and_marks(course_dir):
    async def _go():
        async with Client(mcp) as client:
            return await client.call_tool("analyze_past_exams", {})

    res = anyio.run(_go)
    assert res.is_error is False
    p = _payload(res)
    assert "exactly predict" in p["disclaimer"]
    assert p["dataset"]["questions_found"] >= 2
    assert p["question_types"], "expected question type counts"
    assert p["marks_distribution"]["counted"] >= 2
    assert p["templates"], "expected at least one wording template"
    assert p["findings"], "expected findings with citations"
    for f in p["findings"]:
        assert f["sources"], "each finding must cite sources"
        assert any("exam_2024.pdf" in s for s in f["sources"])


def test_analyze_no_exams_ok(tmp_path, monkeypatch):
    course = tmp_path / "Empty"
    (course / "lectures").mkdir(parents=True)
    (course / "past_exams").mkdir(parents=True)
    monkeypatch.setenv("SENTRA_COURSE_DIR", str(course))
    out = analysis_prep.analyze_course(course)
    assert out["dataset"]["questions_found"] == 0
    assert out["findings"] == []
    assert "exactly predict" in out["disclaimer"]
