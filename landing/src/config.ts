/**
 * Site-wide configuration.
 *
 * GITHUB_URL is the single source of truth for the repository link.
 * The bootstrap prompt and all GitHub buttons derive from it — never
 * hardcode the URL anywhere else.
 */
export const GITHUB_URL: string = "https://github.com/mo22zy2/Sentra-MCP";
export const REPO_CLONE_URL: string = `${GITHUB_URL}.git`;

export const OPENCODE_DOCS_URL = "https://opencode.ai/docs/mcp-servers/";
export const MCP_SDK_URL = "https://github.com/modelcontextprotocol/python-sdk";

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
      "environment": { "SENTRA_COURSE_DIR": "<ABSOLUTE_PATH_TO_COURSE_FOLDER>" },
      "enabled": true,
      "timeout": 30000
    }
  }
}`;

export const FOLDER_TREE = `Operating-Systems/
├── lectures/
│   ├── lecture_01.pdf
│   └── lecture_02.pdf
├── past_exams/
│   └── exam_2025.pdf
└── output/`;

/**
 * Copy-paste bootstrap prompt. The student pastes this into OpenCode and the
 * agent performs the whole installation + configuration on the student's own
 * machine. The repo URL is injected so there is exactly one source of truth.
 */
export const BOOTSTRAP_PROMPT = `Install Sentra on this computer: first make sure \`uv\` is installed (on Windows run \`winget install -e --id astral-sh.uv\`, otherwise \`pip install uv\`), then run \`uvx sentra-mcp init\` to configure OpenCode and create my course folder. Verify the 5 sentra tools are available (list_course_pdfs, extract_pdf_text, analyze_past_exams, prepare_exam_brief, save_exam_files), then tell me where to drop my lecture PDFs and past exams, in simple words. Never upload my files anywhere. If any step fails, fix it yourself or explain the single next action in plain words.`;
