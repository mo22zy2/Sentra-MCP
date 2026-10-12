"""Deep-search evidence collection + doctor style card."""

from __future__ import annotations

from pathlib import Path

import pymupdf

from sentra import course_store, exam_spec


def _pdf(path: Path, pages: list[str]) -> None:
    doc = pymupdf.open()
    for text in pages:
        page = doc.new_page()
        page.insert_text((72, 72), text)
    doc.save(path)
    doc.close()


def _course(tmp_path: Path) -> Path:
    course = tmp_path / "Deep"
    (course / "lectures").mkdir(parents=True)
    (course / "past_exams").mkdir(parents=True)
    (course / "output").mkdir(parents=True)
    filler = "Introductory paragraph about general study habits and course logistics. " * 8
    _pdf(course / "lectures" / "big.pdf", [filler, filler, filler, filler,
        "Bankers algorithm avoids deadlock by simulating resource allocation safely. " * 8])
    return course


def test_deep_search_finds_late_pages(tmp_path: Path):
    course = _course(tmp_path)
    excerpts, coverage = exam_spec.collect_evidence(course, topics=["Bankers"])
    assert coverage["Bankers"], "topic on page 5 must be found"
    assert any("p5" in src for src in coverage["Bankers"])
    pages = {e["page"] for e in excerpts}
    assert 5 in pages, "excerpts must include the deep page, not just openings"


def test_unknown_topic_has_empty_coverage(tmp_path: Path):
    course = _course(tmp_path)
    _, coverage = exam_spec.collect_evidence(course, topics=["Quantum"])
    assert coverage["Quantum"] == []


def test_style_signature_names_templates():
    analysis = {
        "question_types": {"MCQ": 6, "Short Answer": 2},
        "templates": {"Define X": 4, "Compare X and Y": 2},
        "difficulty_approx": {"Easy (approx)": 3},
        "marks_distribution": {"counted": 4, "min": 2, "max": 5},
    }
    lines = exam_spec.style_signature(analysis)
    blob = "\n".join(lines)
    assert "Doctor style card" in blob
    assert "Define X" in blob
    assert "2-5" in blob


def test_brief_contains_style_card_and_deep_search(course_dir):
    spec = exam_spec.ExamSpec.model_validate({
        "course_name": "Operating Systems",
        "duration_minutes": 60,
        "num_questions": 2,
        "question_types": ["Short Answer"],
        "difficulty": {"easy": 50, "medium": 50, "hard": 0},
        "language": "English",
    })
    excerpts, coverage = exam_spec.collect_evidence(course_dir, spec.topics)
    analysis = {"question_types": {"Short Answer": 2}, "templates": {},
                "difficulty_approx": {}, "marks_distribution": {},
                "dataset": {"questions_found": 2}}
    brief = exam_spec.build_brief(spec, excerpts, analysis, coverage)
    assert "Doctor style card" in brief["brief_markdown"]
    assert "deep search" in brief["brief_markdown"].lower()
