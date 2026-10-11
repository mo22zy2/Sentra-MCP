"""Course dir validation + traversal guard + discovery."""

from __future__ import annotations

import pytest

from sentra import course_store


def test_discover_lists_lectures_and_exams(course_dir):
    out = course_store.discover_pdfs(course_dir)
    lecture_paths = {e["path"] for e in out["lectures"]}
    exam_paths = {e["path"] for e in out["past_exams"]}
    assert "lectures/lecture_01.pdf" in lecture_paths
    assert "past_exams/exam_2024.pdf" in exam_paths
    # empty + corrupt surface as unreadable, never crash
    reasons = {e["path"]: e["reason"] for e in out["unreadable"]}
    assert "lectures/empty.pdf" in reasons


def test_missing_course_dir_raises(tmp_path, monkeypatch):
    monkeypatch.setenv("SENTRA_COURSE_DIR", str(tmp_path / "nope"))
    with pytest.raises(course_store.CourseAccessError):
        course_store.resolve_course_dir()


def test_traversal_blocked(course_dir):
    with pytest.raises(course_store.CourseAccessError):
        course_store.resolve_inside(course_dir, "../outside.pdf")
    with pytest.raises(course_store.CourseAccessError):
        course_store.resolve_inside(course_dir, "..\\windows\\secret.pdf")
    # absolute outside path also blocked (joined then resolved -> outside)
    with pytest.raises(course_store.CourseAccessError):
        course_store.resolve_inside(course_dir, "/etc/passwd")


def test_resolve_inside_ok(course_dir):
    p = course_store.resolve_inside(course_dir, "lectures/lecture_01.pdf")
    assert p.is_file()
