"""Prompts-first workflow: loader verbatim, schemaless saver, MCP exposure."""

from __future__ import annotations

import json
from pathlib import Path

import anyio
import pytest

from mcp import Client

from sentra import pipeline_files, workflow_prompts
from sentra.server import mcp


def _payload(result) -> dict:
    return json.loads(result.content[0].text)  # type: ignore[attr-defined]


def _prompt_text(result) -> str:
    """Flatten GetPromptResult messages to plain text (SDK-shape tolerant)."""
    msgs = getattr(result, "messages", []) or []
    parts: list[str] = []
    for m in msgs:
        content = getattr(m, "content", None)
        if content is None:
            parts.append(str(m))
            continue
        if isinstance(content, str):
            parts.append(content)
            continue
        if isinstance(content, list):
            for block in content:
                parts.append(getattr(block, "text", str(block)))
            continue
        parts.append(getattr(content, "text", str(content)))
    return "\n".join(parts)


def _resource_text(result) -> str:
    contents = getattr(result, "contents", []) or []
    parts: list[str] = []
    for c in contents:
        parts.append(getattr(c, "text", str(c)))
    return "\n".join(parts)


def test_loader_serves_all_prompts_verbatim():
    repo_root = Path(__file__).resolve().parents[1] / "prompts"
    expected_files = {
        "extract_text": "Extracting_Text_from_PDF.md",
        "knowledge_base": "knowledge_base_prompt.md",
        "professor_dna": "professor_dna_prompt.md",
        "exam_targets": "exam_targets_prompt.md",
        "predicted_exam": "predicted_exam_prompt.md",
    }
    for name, filename in expected_files.items():
        text = workflow_prompts.get_prompt_text(name)
        assert len(text.strip()) > 100, f"{name} prompt too short"
        original = (repo_root / filename).read_text(encoding="utf-8")
        assert text == original, f"packaged {name} diverged from prompts/{filename}"


def test_loader_rejects_unknown_and_traversal():
    for bad in ["nope", "../secret", "a/b", "", " knowledge_base", "KNOWLEDGE_BASE"]:
        with pytest.raises(Exception):
            workflow_prompts.get_prompt_text(bad)


def test_pipeline_order_and_next():
    assert workflow_prompts.PIPELINE_ORDER == [
        "extract_text", "knowledge_base", "professor_dna", "exam_targets", "predicted_exam",
    ]
    assert workflow_prompts.next_step("knowledge_base") == "professor_dna"
    assert workflow_prompts.next_step("predicted_exam") is None
    assert workflow_prompts.prompt_for_output("knowledge_base.md") == "knowledge_base"
    assert workflow_prompts.next_step_after_output("knowledge_base.md") == "professor_dna"
    assert workflow_prompts.next_step_after_output("predicted_exam.md") is None
    described = workflow_prompts.describe_pipeline()
    assert [s["name"] for s in described] == workflow_prompts.PIPELINE_ORDER
    assert described[1]["writes"] == "knowledge_base.md"


def test_save_pipeline_schemaless_accepts_any_markdown(tmp_path):
    course = tmp_path / "Course"
    (course / "output").mkdir(parents=True)
    # No structure enforced: whatever the prompt produced is accepted.
    out = pipeline_files.save_pipeline_markdown(course, "knowledge_base.md", "# anything\nmystuff")
    assert out["path"] == "output/knowledge_base.md"
    assert (course / "output" / "knowledge_base.md").read_text().startswith("# anything")
    # Refuses silent overwrite, allows explicit overwrite.
    with pytest.raises(Exception):
        pipeline_files.save_pipeline_markdown(course, "knowledge_base.md", "v2")
    out2 = pipeline_files.save_pipeline_markdown(course, "knowledge_base.md", "v2", overwrite=True)
    assert out2["path"] == "output/knowledge_base.md"
    with pytest.raises(Exception):
        pipeline_files.save_pipeline_markdown(course, "grades.csv", "x")
    with pytest.raises(Exception):
        pipeline_files.save_pipeline_markdown(course, "exam_targets.md", "   ")


def test_workflow_tools_registered_and_roundtrip(course_dir):
    async def _go():
        async with Client(mcp) as client:
            tools = [t.name for t in (await client.list_tools()).tools]
            listed = await client.call_tool("list_workflow_prompts", {})
            got = await client.call_tool("get_workflow_prompt", {"name": "knowledge_base"})
            started = await client.call_tool("start_pipeline", {})
            saved = await client.call_tool(
                "save_pipeline_file",
                {"filename": "knowledge_base.md", "markdown": "# KB\nfrom test"},
            )
            bad = await client.call_tool("get_workflow_prompt", {"name": "nope"})
            return tools, listed, got, started, saved, bad

    tools, listed, got, started, saved, bad = anyio.run(_go)
    for expected in ("list_workflow_prompts", "get_workflow_prompt", "save_pipeline_file", "start_pipeline"):
        assert expected in tools
    assert [s["name"] for s in _payload(listed)["pipeline"]] == workflow_prompts.PIPELINE_ORDER
    payload = _payload(got)
    assert payload["name"] == "knowledge_base"
    assert payload["writes"] == "knowledge_base.md"
    assert payload["next"] == "professor_dna"
    assert "knowledge_base.md" in payload["text"]
    spayload = _payload(started)
    assert spayload["first"]["name"] == "extract_text"
    assert "pipeline" in spayload and spayload["lectures"]
    saved_payload = _payload(saved)
    assert saved_payload["path"] == "output/knowledge_base.md"
    assert saved_payload["next"]["name"] == "professor_dna"
    assert saved_payload["next"]["writes"] == "professor_dna.md"
    assert "professor_dna.md" in saved_payload["next"]["text"]
    assert bad.is_error is True


def test_mcp_prompts_registered_and_get():
    async def _go():
        async with Client(mcp) as client:
            listed = await client.list_prompts()
            names = [p.name for p in listed.prompts]
            bodies = {}
            for n in ("extract_text", "knowledge_base", "professor_dna", "exam_targets", "predicted_exam"):
                bodies[n] = _prompt_text(await client.get_prompt(n))
            return names, bodies

    names, bodies = anyio.run(_go)
    for n in ("extract_text", "knowledge_base", "professor_dna", "exam_targets", "predicted_exam"):
        assert n in names, f"prompt '{n}' not registered"
    assert "knowledge_base.md" in bodies["knowledge_base"]
    assert "professor_dna.md" in bodies["professor_dna"]
    assert "exam_targets.md" in bodies["exam_targets"]
    assert "predicted_exam.md" in bodies["predicted_exam"]
    assert len(bodies["extract_text"]) > 100


def test_mcp_resource_serves_prompt_text():
    async def _go():
        async with Client(mcp) as client:
            return _resource_text(await client.read_resource("prompt://knowledge_base"))

    text = anyio.run(_go)
    assert "knowledge_base.md" in text
