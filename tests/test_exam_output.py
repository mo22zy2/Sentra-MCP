"""Exam spec, brief, and safe file output."""

from __future__ import annotations

import json

import anyio
import pytest

from mcp import Client

from sentra import exam_files, exam_spec
from sentra.server import mcp


def _good_spec(**over) -> dict:
    base = {
        "course_name": "Operating Systems",
        "duration_minutes": 120,
        "num_questions": 5,
        "question_types": ["MCQ", "Short Answer"],
        "difficulty": {"easy": 20, "medium": 35, "hard": 45},
        "language": "English",
    }
    base.update(over)
    return base


def _payload(result) -> dict:
    return json.loads(result.content[0].text)  # type: ignore[attr-defined]


def test_spec_ok():
    s = exam_spec.ExamSpec.model_validate(_good_spec())
    assert s.course_name == "Operating Systems"


def test_spec_bad_difficulty_sum():
    with pytest.raises(Exception):
        exam_spec.ExamSpec.model_validate(
            _good_spec(difficulty={"easy": 50, "medium": 50, "hard": 50})
        )


def test_spec_bad_type():
    with pytest.raises(Exception):
        exam_spec.ExamSpec.model_validate(_good_spec(question_types=["Telepathy"]))


def test_brief_flags_unknown_topic(course_dir):
    async def _go():
        async with Client(mcp) as client:
            return await client.call_tool(
                "prepare_exam_brief",
                {"spec": _good_spec(topics=["Quantum Chromodynamics"])},
            )

    res = anyio.run(_go)
    assert res.is_error is False
    p = _payload(res)
    assert "brief_markdown" in p
    assert "Hard constraints" in p["brief_markdown"]
    assert any("Quantum Chromodynamics" in w for w in p["warnings"])


def test_save_rejects_answers_in_exam(course_dir):
    with pytest.raises(exam_files.ExamFileError, match="[Ss]eparation"):
        exam_files.save_pair(
            course_dir,
            "# Practice Mock Exam\nQ1 Define process here in detail please.\n## Answer Key\n1. A is correct because reasons.\n" + ("q" * 60),
            "# Answer Key\n1. A because ... answer explanation here.\n" + ("a" * 60),
            "mock1",
        )


def test_save_collision_and_overwrite(course_dir):
    exam = "# Practice Mock Exam\nQ1 Define process. [Uncertain]\n" + ("x" * 60)
    key = "# Answer Key\nA1: A process is ... answer ...\n" + ("y" * 60)
    out1 = exam_files.save_pair(course_dir, exam, key, "mock1")
    assert out1["exam_path"] == "output/mock1_exam.md"
    with pytest.raises(exam_files.ExamFileError, match="[Oo]verwrite"):
        exam_files.save_pair(course_dir, exam, key, "mock1")
    out2 = exam_files.save_pair(course_dir, exam, key, "mock1", overwrite=True)
    assert out2["answer_key_path"] == "output/mock1_answers.md"


def test_basename_traversal_rejected(course_dir):
    with pytest.raises(exam_files.ExamFileError):
        exam_files.save_pair(course_dir, "e" * 60, "a" * 60, "../evil")
    with pytest.raises(exam_files.ExamFileError):
        exam_files.save_pair(course_dir, "e" * 60, "a" * 60, "a/b")


def test_save_tools_registered_and_end_to_end(course_dir):
    async def _list():
        async with Client(mcp) as client:
            res = await client.list_tools()
            return [t.name for t in res.tools]

    found = anyio.run(_list)
    assert "prepare_exam_brief" in found
    assert "save_exam_files" in found

    async def _go():
        async with Client(mcp) as client:
            brief = await client.call_tool("prepare_exam_brief", {"spec": _good_spec()})
            assert brief.is_error is False
            exam = "# Practice Mock Exam\nQ1 Define process. (lectures/lecture_01.pdf:1)\n" + ("q" * 60)
            key = "# Answer Key\nA1 answer: a running program. Source lectures/lecture_01.pdf:1\n" + ("a" * 60)
            return await client.call_tool(
                "save_exam_files",
                {"exam_markdown": exam, "answer_key_markdown": key, "basename": "e2e_mock"},
            )

    res = anyio.run(_go)
    assert res.is_error is False
    p = _payload(res)
    assert p["exam_path"] == "output/e2e_mock_exam.md"
