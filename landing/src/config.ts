/**
 * Site-wide configuration.
 *
 * GITHUB_URL is the single source of truth for the repository link.
 * The QuickStart journey and all GitHub buttons derive from it — never
 * hardcode the URL anywhere else.
 */
export const GITHUB_URL: string = "https://github.com/mo22zy2/Sentra-MCP";

/** The exact sentence the student pastes into OpenCode next to the link. */
export const AGENT_SENTENCE = "download and run this mcp";

/** Every supported AI agent: official download + docs (both verified) and
 *  the one-line setup. `setup` mirrors `sentra-mcp init --agent <id>`. */
export const AGENT_CARDS = [
  { id: "opencode", name: "OpenCode", download: "https://opencode.ai", docs: "https://opencode.ai/docs/mcp-servers/", setup: "uvx sentra-mcp init" },
  { id: "claude", name: "Claude Code", download: "https://claude.com/claude-code", docs: "https://docs.anthropic.com/en/docs/claude-code/mcp", setup: "claude mcp add --transport stdio sentra -- uvx sentra-mcp" },
  { id: "cursor", name: "Cursor", download: "https://cursor.com/download", docs: "https://cursor.com/docs/mcp", setup: "uvx sentra-mcp init --agent cursor" },
  { id: "vscode", name: "VS Code", download: "https://code.visualstudio.com/download", docs: "https://code.visualstudio.com/docs/agent-customization/mcp-servers", setup: "uvx sentra-mcp init --agent vscode" },
  { id: "gemini", name: "Gemini CLI", download: "https://geminicli.com", docs: "https://geminicli.com/docs/tools/mcp-server/", setup: "uvx sentra-mcp init --agent gemini" },
  { id: "windsurf", name: "Windsurf", download: "https://windsurf.com", docs: "https://docs.windsurf.com/windsurf/cascade", setup: "uvx sentra-mcp init --agent windsurf" },
  { id: "cline", name: "Cline", download: "https://cline.bot", docs: "https://docs.cline.bot/mcp/mcp-overview", setup: "uvx sentra-mcp init --agent cline" },
] as const;

export const OPENCODE_DOCS_URL = "https://opencode.ai/docs/mcp-servers/";
export const MCP_SDK_URL = "https://github.com/modelcontextprotocol/python-sdk";

export const CONTACT_EMAIL = "moja3222@gmail.com";

export const INSTALL_COMMANDS = {
  installUvWin: "winget install -e --id astral-sh.uv",
  installUvAlt: "pip install uv",
  init: "uvx sentra-mcp init",
} as const;

export const OPENCODE_CONFIG_JSON = `{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "sentra": {
      "type": "local",
      "command": ["uvx", "sentra-mcp"],
      "enabled": true,
      "timeout": 30000
    }
  }
}`;

export const FOLDER_TREE = `Course-Folder/   (the folder opened in OpenCode)
├── lectures/
│   └── lecture_01.pdf
├── past_exams/
│   └── exam_2025.pdf
└── output/`;

