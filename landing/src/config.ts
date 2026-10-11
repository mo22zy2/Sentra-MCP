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
  condaCreate: "conda create -n mcp python=3.11 -y",
  condaActivate: "conda activate mcp",
  pipUv: "pip install uv",
  cdRepo: "cd /path/to/sentra",
  uvSync_win: "uv sync --python %CONDA_PREFIX%\\python.exe",
  uvSync_unix: 'uv sync --python "$CONDA_PREFIX/bin/python"',
  verifyImport: 'uv run python -c "from mcp.server import MCPServer; import pymupdf; print(\'ok\')"',
  verifyTests: "uv run pytest -q",
} as const;

export const OPENCODE_CONFIG_JSON = `{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "sentra": {
      "type": "local",
      "command": ["uv", "--directory", "C:\\\\Users\\\\LOQ\\\\Desktop\\\\MCP", "run", "sentra"],
      "environment": { "SENTRA_COURSE_DIR": "C:\\\\Users\\\\LOQ\\\\Desktop\\\\MCP\\\\OS-Course" },
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
export const BOOTSTRAP_PROMPT = `You are setting up Sentra for a non-technical student on their own computer. Do every step below yourself — never ask the student to run commands or edit files.

GOAL: Install Sentra (a local-first MCP server for mock exams), register it in OpenCode, and verify it works. Everything stays on this machine. NEVER upload the student's files anywhere.

STEPS:
1. Get Sentra: \`git clone ${REPO_CLONE_URL}\` (into ~/Documents/Sentra, or use the current folder if it is empty). If git is missing, download the ZIP from ${GITHUB_URL} and extract it.
2. Install: make sure Python 3.11+ is available (create a conda env named mcp with Python 3.11 if needed), install uv via \`pip install uv\` if missing, then run \`uv sync\` inside the repo. Verify with \`uv run pytest -q\` (expect 26 passed).
3. Configure OpenCode WITHOUT deleting anything: open the user's OpenCode config file (opencode.json) and ADD this block under "mcp" (create "mcp" if it is missing, keep every other key untouched):
   "sentra": { "type": "local", "command": ["uv", "--directory", "<ABSOLUTE_REPO_PATH>", "run", "sentra"], "environment": { "SENTRA_COURSE_DIR": "<ABSOLUTE_COURSE_PATH>" }, "enabled": true, "timeout": 30000 }
   Replace <ABSOLUTE_REPO_PATH> and <ABSOLUTE_COURSE_PATH> with real absolute paths on this machine.
4. Create the course folder (default: OS-Course next to the repo) with subfolders lectures/, past_exams/, output/.
5. Verify: confirm the 5 sentra tools are available to you now: list_course_pdfs, extract_pdf_text, analyze_past_exams, prepare_exam_brief, save_exam_files.
6. Tell the student (in their language, in simple words): where to drop lecture PDFs and past exams, then offer to analyze them right away.

RULES: If any step fails, fix it yourself or explain the single next action in plain words. Never invent URLs, commands, or config keys. Never send files to any external server.`;
