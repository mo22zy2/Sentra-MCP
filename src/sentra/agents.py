"""Multi-agent registry: download links, config locations and formats.

Every format below was verified against the agent's official docs:
- OpenCode: https://opencode.ai/docs/mcp-servers/ (type: local, command[])
- Claude Code: https://docs.anthropic.com/en/docs/claude-code/mcp
  (.mcp.json project file with mcpServers>command+args, or
  `claude mcp add --transport stdio sentra -- uvx sentra-mcp`)
- Cursor: https://cursor.com/docs/mcp and https://cursor.com/help/customization/mcp
  (.cursor/mcp.json project or ~/.cursor/mcp.json global, mcpServers)
- VS Code: https://code.visualstudio.com/docs/agent-customization/mcp-servers
  (portable .mcp.json with mcpServers; .vscode/mcp.json uses "servers")
- Gemini CLI: https://geminicli.com/docs/tools/mcp-server/
  (settings.json mcpServers with command+args)

No paths or keys are invented. Anything unverified is documented as such.
"""

from __future__ import annotations

from pathlib import Path


def _stdio_entry() -> dict:
    return {"command": "uvx", "args": ["sentra-mcp"]}


def _opencode_block() -> dict:
    return {
        "type": "local",
        "command": ["uvx", "sentra-mcp"],
        "enabled": True,
        "timeout": 30000,
    }


def _merge_root_key(data: dict, root_key: str) -> dict:
    node = data.get(root_key)
    if node is None:
        node = {}
        data[root_key] = node
    if not isinstance(node, dict):
        raise ValueError(f'"{root_key}" must be a JSON object.')
    return node


def _merge_opencode(data: dict) -> None:
    node = _merge_root_key(data, "mcp")
    node["sentra"] = _opencode_block()


def _merge_mcp_servers(data: dict) -> None:
    node = _merge_root_key(data, "mcpServers")
    node["sentra"] = _stdio_entry()


def _merge_vscode_servers(data: dict) -> None:
    node = _merge_root_key(data, "servers")
    node["sentra"] = _stdio_entry()


def _home(*parts: str) -> Path:
    return Path.home().joinpath(*parts)


AGENTS: dict[str, dict] = {
    "opencode": {
        "name": "OpenCode",
        "download": "https://opencode.ai",
        "docs": "https://opencode.ai/docs/mcp-servers/",
        "kind": "opencode",
        "merge": _merge_opencode,
        "hint": "Restart OpenCode so the sentra tools appear.",
    },
    "claude": {
        "name": "Claude Code",
        "download": "https://claude.com/claude-code",
        "docs": "https://docs.anthropic.com/en/docs/claude-code/mcp",
        "kind": "project",
        "filename": ".mcp.json",
        "merge": _merge_mcp_servers,
        "alt": "claude mcp add --transport stdio sentra -- uvx sentra-mcp",
        "hint": "Approve the server when Claude Code asks (project .mcp.json).",
    },
    "cursor": {
        "name": "Cursor",
        "download": "https://cursor.com/download",
        "docs": "https://cursor.com/docs/mcp",
        "kind": "project",
        "filename": ".cursor/mcp.json",
        "merge": _merge_mcp_servers,
        "hint": "Cursor picks up .cursor/mcp.json; toggle in Settings if needed.",
    },
    "vscode": {
        "name": "VS Code",
        "download": "https://code.visualstudio.com/download",
        "docs": "https://code.visualstudio.com/docs/agent-customization/mcp-servers",
        "kind": "project",
        "filename": ".vscode/mcp.json",
        "merge": _merge_vscode_servers,
        "hint": "Prefer the portable .mcp.json at the project root for cross-tool use.",
    },
    "gemini": {
        "name": "Gemini CLI",
        "download": "https://geminicli.com",
        "docs": "https://geminicli.com/docs/tools/mcp-server/",
        "kind": "global",
        "path_parts": (".gemini", "settings.json"),
        "merge": _merge_mcp_servers,
        "alt": "gemini mcp add sentra -- uvx sentra-mcp",
        "hint": "Check /mcp inside Gemini CLI to confirm connection.",
    },
}

AGENT_IDS = tuple(AGENTS)


def project_file(agent_id: str, course_dir: Path) -> Path:
    spec = AGENTS[agent_id]
    if spec["kind"] != "project":
        raise ValueError(f"Agent '{agent_id}' is not project-scoped.")
    return course_dir / spec["filename"]


def global_file(agent_id: str) -> Path:
    """Resolve a global agent config path lazily (honors monkeypatched HOME)."""
    spec = AGENTS[agent_id]
    if spec["kind"] != "global":
        raise ValueError(f"Agent '{agent_id}' is not globally-scoped.")
    return _home(*spec["path_parts"])
