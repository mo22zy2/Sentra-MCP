"""PDF extraction: refs, empty/corrupt, insufficient text, paging."""

from __future__ import annotations

import pytest

from sentra import pdf_reader


def test_extract_preserves_pages(course_dir):
    pdf = course_dir / "lectures" / "lecture_02.pdf"
    out = pdf_reader.extract_pages(pdf)
    assert out["total_pages"] == 2
    assert out["pages"][0]["page_no"] == 1
    assert out["pages"][1]["page_no"] == 2
    assert "scheduling" in out["pages"][0]["text"]
    assert "deadlock" in out["pages"][1]["text"]
    assert out["insufficient_text"] is False


def test_extract_page_window(course_dir):
    pdf = course_dir / "lectures" / "lecture_02.pdf"
    out = pdf_reader.extract_pages(pdf, page_start=2, page_end=2)
    assert len(out["pages"]) == 1
    assert out["pages"][0]["page_no"] == 2


def test_empty_pdf_raises(course_dir):
    with pytest.raises(pdf_reader.PDFReadError, match="empty"):
        pdf_reader.extract_pages(course_dir / "lectures" / "empty.pdf")


def test_corrupt_pdf_raises(course_dir):
    with pytest.raises(pdf_reader.PDFReadError, match="[Cc]orrupt|Cannot open"):
        pdf_reader.extract_pages(course_dir / "lectures" / "corrupt.pdf")


def test_scanned_blank_flagged(course_dir):
    out = pdf_reader.extract_pages(course_dir / "lectures" / "scanned.pdf")
    assert out["insufficient_text"] is True
    assert out["note"] is not None


def test_bad_page_range_rejected(course_dir):
    pdf = course_dir / "lectures" / "lecture_01.pdf"
    with pytest.raises(pdf_reader.PDFReadError):
        pdf_reader.extract_pages(pdf, page_start=0)
    with pytest.raises(pdf_reader.PDFReadError):
        pdf_reader.extract_pages(pdf, page_start=3, page_end=2)
