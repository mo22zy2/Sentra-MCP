"""Shared fixtures: synthetic course dir with public-domain-style PDFs."""

from __future__ import annotations

import os
from pathlib import Path

import pymupdf
import pytest


def _make_pdf(path: Path, pages_text: list[str]) -> None:
    doc = pymupdf.open()
    for t in pages_text:
        page = doc.new_page()
        page.insert_text((72, 72), t)
    doc.save(path)
    doc.close()


@pytest.fixture()
def course_dir(tmp_path: Path, monkeypatch) -> Path:
    course = tmp_path / "Course"
    (course / "lectures").mkdir(parents=True)
    (course / "past_exams").mkdir(parents=True)
    (course / "output").mkdir(parents=True)
    _make_pdf(
        course / "lectures" / "lecture_01.pdf",
        ["Operating Systems Ch1: Processes\nA process is a running program.\nQ1Define process. (2 marks)"],
    )
    _make_pdf(
        course / "lectures" / "lecture_02.pdf",
        [
            "Page one content about CPU scheduling algorithms including FCFS and Round Robin with examples.",
            "Page two about deadlock detection, prevention, avoidance, and the Bankers algorithm in detail.",
        ],
    )
    _make_pdf(
        course / "past_exams" / "exam_2024.pdf",
        ["Q1 Define process. (2 marks)\nQ2 Compare threads vs processes. (5 marks)"],
    )
    # Blank (image-like, no text) -> insufficient_text
    doc = pymupdf.open()
    doc.new_page()
    doc.save(course / "lectures" / "scanned.pdf")
    doc.close()
    # Empty file
    (course / "lectures" / "empty.pdf").write_bytes(b"")
    # Corrupt file
    (course / "lectures" / "corrupt.pdf").write_bytes(b"%PDF-not-really-a-pdf%%EOF garbage")
    # Non-pdf
    (course / "lectures" / "notes.txt").write_text("hello")
    monkeypatch.setenv("SENTRA_COURSE_DIR", str(course))
    monkeypatch.chdir(tmp_path)
    return course
