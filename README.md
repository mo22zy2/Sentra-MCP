# Sentra — AI-Powered Mock Exam Generator (local-first MCP server)

Sentra is a local-first **MCP server** for university students. It lets you
generate realistic mock exams from your lecture PDFs and previous exams.

**OpenCode is the AI client, Sentra is the tool it calls.** The MCP server
does document extraction, validation, analysis prep, and local file
operations. Your configured AI model (via OpenCode) does the reasoning and
writes the questions. Model inference costs depend on your chosen provider —
Sentra itself makes no model calls and costs nothing.

No hosted backend, no cloud database, no file storage, no auth service.
Everything runs on your machine. Nothing you study is uploaded anywhere
by Sentra.

Bilingual product site + docs: [`landing/`](landing/) (English / Egyptian Arabic).

## For AI agents: bootstrap contract (read this if the user pasted this repo's link)

The user wants Sentra installed and running. Do everything below yourself.
Never ask the student to run commands or edit files. Everything stays on this
machine — NEVER upload their files anywhere.

1. Install: if `uvx sentra-mcp init` works, use it. Otherwise `git clone`
   this repo, then `uv sync` inside it (install `uv` first via
   `pip install uv` if missing; create a Python 3.11 environment if no
   Python 3.11+ exists). Verify with `uv run pytest -q` (expect 30 passed).
2. Configure: add the `sentra` block from `opencode.jsonc.example` under
   `mcp` in the user's `opencode.json` (create `mcp` if missing, keep every
   other key). Prefer command `["uvx", "sentra-mcp"]`; from source use
   `["uv", "--directory", "<ABSOLUTE_REPO_PATH>", "run", "sentra"]`.
   No paths needed: the folder already opened is the course folder.
3. Course folder: make sure `lectures/`, `past_exams/` and `output/` exist
   where the user works (the server auto-creates them). Tell the user to
   drop PDFs into `lectures/` and past exams into `past_exams/`.
4. Verify the 5 tools respond: list_course_pdfs, extract_pdf_text,
   analyze_past_exams, prepare_exam_brief, save_exam_files.
5. Tell the user (simply, in their language): the exact folder to drop PDFs
   into, and that they must RESTART OpenCode for the tools to appear.
6. Making exams: for EACH exam requested, call `prepare_exam_brief` with its
   spec, write original questions (never copy past exams), then
   `save_exam_files` with a DIFFERENT basename per exam (e.g. mock1, mock2).
   Never reuse a basename unless the user says overwrite. Every answer key
   stays in its separate `*_answers.md` file.

## Fastest start: copy the link, OpenCode does the rest

1. Copy this repo link: \https://github.com/mo22zy2/Sentra-MCP2. In OpenCode, paste it and say: \download and run this mcp3. Restart OpenCode so the sentra tools appear.
4. Drop lecture PDFs into \lectures/\ and past exams into \past_exams/\.
5. Say: `make me 2 exams using the sentra mcp` - collect both exams and both answer keys from `output/`.

Not on OpenCode? Same flow, your agent's config: `uvx sentra-mcp init --agent <claude|cursor|vscode|gemini>` writes the right file and format for each (Claude Code also accepts `claude mcp add --transport stdio sentra -- uvx sentra-mcp`). Every agent reads the same local `lectures/`, `past_exams/`, `output/` folders.

Prefer to run it yourself?

Prerequisite (once): install `uv` — Windows: `winget install -e --id astral-sh.uv`,
macOS/Linux or any Python: `pip install uv`.

```bash
uvx sentra-mcp init
```

`init` creates your course folder, adds Sentra to your `opencode.json`
(backing it up first, never deleting your other settings), and tells you
where to drop PDFs — in plain words. Then open OpenCode and paste:

```text
Verify the 5 sentra tools work, then analyze my past exams and summarize the professor's question patterns.
```

Or skip the terminal entirely: paste this into OpenCode and the agent will
run the setup for you:

```text
Install Sentra on this computer: make sure `uv` is installed (install it if missing), then run `uvx sentra-mcp init` to configure OpenCode and create my course folder. Verify the 5 sentra tools are available, then tell me where to drop my lecture PDFs and past exams, in simple words. Never upload my files anywhere.
```

Then drop lecture PDFs into `lectures/`, past exams into `past_exams/`, and ask:

- "Analyze the previous exams and summarize the professor's question patterns."
- "Generate a two-hour Operating Systems mock exam with an answer key."

You get `output/<name>_exam.md` + `output/<name>_answers.md`, saved locally.

## Manual install (developers)

Requires: Miniconda/Anaconda, Python 3.11.

```bash
git clone https://github.com/mo22zy2/Sentra-MCP.git
cd Sentra-MCP
conda create -n mcp python=3.11 -y
conda activate mcp
pip install uv
uv sync --python "$CONDA_PREFIX/bin/python"   # Windows: uv sync --python %CONDA_PREFIX%\python.exe
```

Verify (tested on Python 3.11.17, MCP SDK 2.3.0, PyMuPDF 1.28.2):

```bash
uv run python -c "from mcp.server import MCPServer; import pymupdf; print('ok')"
uv run pytest -q               # expect: 30 passed
```

### OpenCode configuration

1. Install OpenCode per https://opencode.ai/docs and configure any
   compatible provider/model. That provider bills you if paid.
2. Copy `opencode.jsonc.example` into your OpenCode config (`opencode.json`).
   No paths needed when you open OpenCode in the course folder:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "sentra": {
      "type": "local",
      "command": ["uvx", "sentra-mcp"],
      "enabled": true,
      "timeout": 30000
    }
  }
}
```

(`uvx` fetches `sentra-mcp` from PyPI on first run — no clone needed.
Developers running from source can use
`["uv", "--directory", "<ABSOLUTE_PATH_TO_SENTRA_REPO>", "run", "sentra"]`
instead.)

Verified against https://opencode.ai/docs/mcp-servers: `type: "local"`
+ `command[]` array, `enabled`, `timeout`. No `environment` needed by default
(the opened folder is the course folder). Never put API keys here.

### Course folder

```
<the folder you opened in OpenCode>/
├── lectures/     # lecture PDFs, primary source (auto-created)
├── past_exams/   # previous exam PDFs, style evidence (auto-created)
└── output/       # generated *_exam.md + *_answers.md (auto-created)
```

Flat subfolders only — no reorganization needed. Supported format:
**PDF only** in this version (`.txt`/`.docx` are rejected with a clear error).

## Tools (5, all local)

| Tool | What it does |
|---|---|
| `list_course_pdfs` | Lists `lectures/` + `past_exams/` PDFs, reports unreadable files. Never leaves the course dir. |
| `extract_pdf_text` | Page-preserving text extraction (50 pages / 60k chars per call). Flags scanned PDFs instead of returning silent empties. No OCR. |
| `analyze_past_exams` | Question types, wording templates, approx difficulty, marks — every finding cites `file:page`. Past patterns only; never claims to predict the real exam. |
| `prepare_exam_brief` | Validates your exam spec, returns a grounded brief + warnings for unsupported topics. The agent writes the questions. |
| `save_exam_files` | Validates exam/answer-key separation and saves `output/<name>_exam.md` + `<name>_answers.md`. Refuses silent overwrites. |

`prompts/` holds the 5 agent workflow prompts (extract → knowledge base →
professor DNA → targets → predicted exam).

## Privacy

- Sentra processes and saves everything on your machine and uploads nothing.
- If your OpenCode model is cloud-hosted, the content you ask about is sent
  to that provider — local processing does not guarantee content stays local.
- Scanned/image PDFs are flagged `insufficient_text: true`. OCR is out of scope.

## Limits & safety

- 50 MB per file; 50 pages / 60 000 chars per `extract_pdf_text` call;
  12 000-char lecture budget per brief.
- All paths resolve inside the course dir (`../` escapes rejected).
- PDFs are treated as untrusted data (never executed). Corrupt/empty PDFs
  return clear errors. No secrets in logs or config.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `No PDFs listed` | Put files in `lectures/` or `past_exams/` inside the opened folder (auto-created). |
| `Access denied ... escapes the course directory` | Use `lectures/x.pdf`-style relative paths only. |
| Tools missing in OpenCode | `opencode mcp list`, then restart OpenCode. If still missing, re-run `uvx sentra-mcp init` in the course folder. |
| `... must sum to 100` | Difficulty `{easy,medium,hard}` must total exactly 100. |
| `Refusing to overwrite` | New `basename` or `overwrite: true`. |
| `Unsupported file type` | This version reads PDFs only. |
| `insufficient_text: true` | Scanned PDF — use a text-based export. |
| `Unknown question types` | Allowed: MCQ, True/False, Short Answer, Essay, Numerical, Comparison, Diagram, Case Study, Application, Analysis, Problem Solving. |

## Tests

```bash
conda activate mcp
uv run pytest -q
```

Covers extraction, empty/corrupt PDFs, page refs, dir validation, traversal
blocks, input/spec/output validation, key separation, filename collisions,
`init` config merge + backups, and MCP registration via in-memory `Client(mcp)`.
Fixtures are synthetic — never commit private materials (see `.gitignore`:
course PDFs are excluded).

## Contributing

Open an issue or pull request at
https://github.com/mo22zy2/Sentra-MCP with your OS, Python version, the
command you ran, and the full error message. Never attach private course
materials.
