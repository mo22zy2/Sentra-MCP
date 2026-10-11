"""MCP tool registration + execution via in-memory Client (SDK v2 pattern)."""

from __future__ import annotations

import json

import anyio

from mcp import Client

from sentra.server import mcp


def _payload(result) -> dict:
    """SDK v2 without output_schema returns dict as JSON text in content[0]."""
    assert result.content, "empty tool result content"
    text = result.content[0].text  # type: ignore[attr-defined]
    return json.loads(text)


def test_tools_registered():
    async def _list():
        async with Client(mcp) as client:
            res = await client.list_tools()
            return [t.name for t in res.tools]

    found = anyio.run(_list)
    assert "list_course_pdfs" in found
    assert "extract_pdf_text" in found


def test_list_tool_ok(course_dir):
    async def _go():
        async with Client(mcp) as client:
            return await client.call_tool("list_course_pdfs", {})

    res = anyio.run(_go)
    assert res.is_error is False
    payload = _payload(res)
    assert any(e["path"] == "lectures/lecture_01.pdf" for e in payload["lectures"])
    assert any(e["path"] == "past_exams/exam_2024.pdf" for e in payload["past_exams"])


def test_extract_tool_ok(course_dir):
    async def _go():
        async with Client(mcp) as client:
            return await client.call_tool(
                "extract_pdf_text", {"relative_path": "lectures/lecture_01.pdf"}
            )

    res = anyio.run(_go)
    assert res.is_error is False
    payload = _payload(res)
    assert payload["total_pages"] >= 1
    assert payload["pages"][0]["page_no"] == 1
    assert "process" in payload["pages"][0]["text"].lower()


def test_extract_tool_rejects_traversal(course_dir):
    async def _go():
        async with Client(mcp) as client:
            return await client.call_tool("extract_pdf_text", {"relative_path": "../secret.pdf"})

    res = anyio.run(_go)
    assert res.is_error is True


def test_extract_tool_rejects_non_pdf(course_dir):
    async def _go():
        async with Client(mcp) as client:
            return await client.call_tool("extract_pdf_text", {"relative_path": "lectures/notes.txt"})

    res = anyio.run(_go)
    assert res.is_error is True
