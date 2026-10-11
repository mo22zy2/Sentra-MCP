"""PDF text extraction with PyMuPDF. No OCR in MVP — flag insufficient text."""

from __future__ import annotations

from pathlib import Path

import pymupdf  # import pymupdf is the supported name; fitz is legacy alias

from . import settings


class PDFReadError(ValueError):
    pass


def extract_pages(
    pdf_path: Path,
    page_start: int = 1,
    page_end: int | None = None,
) -> dict:
    """Extract text page-by-page, preserving page numbers.

    Streams only requested pages, caps output. Treats content as untrusted
    data (never executed). Raises PDFReadError with useful messages.
    """
    if page_start < 1:
        raise PDFReadError("page_start must be >= 1.")
    if page_end is not None and page_end < page_start:
        raise PDFReadError("page_end must be >= page_start.")

    try:
        size = pdf_path.stat().st_size
    except OSError as exc:
        raise PDFReadError(f"Cannot stat file '{pdf_path.name}': {exc}")
    if size == 0:
        raise PDFReadError(f"File '{pdf_path.name}' is empty (0 bytes).")
    if size > settings.MAX_PDF_BYTES:
        raise PDFReadError(
            f"File '{pdf_path.name}' exceeds {settings.MAX_PDF_BYTES} byte limit."
        )

    try:
        doc = pymupdf.open(pdf_path)
    except Exception as exc:
        raise PDFReadError(f"Cannot open '{pdf_path.name}': corrupt or unsupported PDF ({exc}).")

    try:
        total = doc.page_count
        if total == 0:
            raise PDFReadError(f"File '{pdf_path.name}' has 0 pages.")
        end = page_end or total
        end = min(end, total)
        # Enforce per-call page cap to avoid loading huge docs into the model context.
        if end - page_start + 1 > settings.MAX_PAGES_PER_CALL:
            end = page_start + settings.MAX_PAGES_PER_CALL - 1
            truncated_pages = True
        else:
            truncated_pages = end < total

        pages: list[dict] = []
        chars = 0
        truncated_chars = False
        for i in range(page_start - 1, end):
            try:
                text = doc[i].get_text("text") or ""
            except Exception:
                text = ""
            # Char cap: cut off mid-document rather than blow the context.
            if chars + len(text) > settings.MAX_CHARS_PER_CALL:
                keep = max(0, settings.MAX_CHARS_PER_CALL - chars)
                text = text[:keep]
                truncated_chars = True
                pages.append(_page_entry(i + 1, text))
                break
            pages.append(_page_entry(i + 1, text))
            chars += len(text)

        non_empty = sum(1 for p in pages if len(p["text"].strip()) >= settings.MIN_CHARS_OK_PAGE)
        insufficient = len(pages) > 0 and non_empty == 0
        return {
            "filename": pdf_path.name,
            "total_pages": total,
            "page_start": page_start,
            "page_end": end,
            "pages": pages,
            "truncated": truncated_pages or truncated_chars,
            "insufficient_text": insufficient,
            "note": (
                "Pages contain little or no extractable text "
                "(likely scanned/images). OCR is out of scope for this MVP — "
                "no text was invented."
                if insufficient
                else None
            ),
        }
    finally:
        doc.close()


def _page_entry(page_no: int, text: str) -> dict:
    return {"page_no": page_no, "text": text, "chars": len(text)}
