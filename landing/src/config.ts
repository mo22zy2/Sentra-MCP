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

