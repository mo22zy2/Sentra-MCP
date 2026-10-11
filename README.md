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

## Fastest start: copy one prompt, OpenCode does the rest

No manual setup needed. Paste this into OpenCode and the agent will download
Sentra, install it, configure everything on your machine, and verify it works:

```text
You are setting up Sentra for a non-technical student on their own computer. Do every step below yourself — never ask the student to run commands or edit files.

GOAL: Install Sentra (a local-first MCP server for mock exams), register it in OpenCode, and verify it works. Everything stays on this machine. NEVER upload the student's files anywhere.

STEPS:
1. Get Sentra: `git clone https://github.com/mo22zy2/Sentra-MCP.git` (into ~/Documents/Sentra, or use the current folder if it is empty). If git is missing, download the ZIP from https://github.com/mo22zy2/Sentra-MCP and extract it.
2. Install: make sure Python 3.11+ is available (create a conda env named mcp with Python 3.11 if needed), install uv via `pip install uv` if missing, then run `uv sync` inside the repo. Verify with `uv run pytest -q` (expect 26 passed).
3. Configure OpenCode WITHOUT deleting anything: open the user's OpenCode config file (opencode.json) and ADD this block under "mcp" (create "mcp" if it is missing, keep every other key untouched):
   "sentra": { "type": "local", "command": ["uv", "--directory", "<ABSOLUTE_REPO_PATH>", "run", "sentra"], "environment": { "SENTRA_COURSE_DIR": "<ABSOLUTE_COURSE_PATH>" }, "enabled": true, "timeout": 30000 }
   Replace <ABSOLUTE_REPO_PATH> and <ABSOLUTE_COURSE_PATH> with real absolute paths on this machine.
4. Create the course folder (default: OS-Course next to the repo) with subfolders lectures/, past_exams/, output/.
5. Verify: confirm the 5 sentra tools are available to you now: list_course_pdfs, extract_pdf_text, analyze_past_exams, prepare_exam_brief, save_exam_files.
6. Tell the student (in their language, in simple words): where to drop lecture PDFs and past exams, then offer to analyze them right away.

RULES: If any step fails, fix it yourself or explain the single next action in plain words. Never invent URLs, commands, or config keys. Never send files to any external server.
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
uv run pytest -q               # expect: 26 passed
```

### OpenCode configuration

1. Install OpenCode per https://opencode.ai/docs and configure any
   compatible provider/model. That provider bills you if paid.
2. Copy `opencode.jsonc.example` into your OpenCode config (`opencode.json`),
   replacing `<ABSOLUTE_PATH_TO_SENTRA_REPO>` and
   `<ABSOLUTE_PATH_TO_COURSE_FOLDER>` with real absolute paths:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "sentra": {
      "type": "local",
      "command": ["uv", "--directory", "<ABSOLUTE_PATH_TO_SENTRA_REPO>", "run", "sentra"],
      "environment": { "SENTRA_COURSE_DIR": "<ABSOLUTE_PATH_TO_COURSE_FOLDER>" },
      "enabled": true,
      "timeout": 30000
    }
  }
}
```

Verified against https://opencode.ai/docs/mcp-servers: `type: "local"`
+ `command[]` array, absolute `--directory`, `environment` for the course dir
(not secrets), `enabled`, `timeout`. Never put API keys here.

### Course folder

```
OS-Course/
├── lectures/     # lecture PDFs (primary content source)
├── past_exams/   # previous exam PDFs (style evidence)
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
| `Course directory does not exist` | Create it or set `SENTRA_COURSE_DIR` to an existing absolute folder. |
| `Access denied ... escapes the course directory` | Use `lectures/x.pdf`-style relative paths only. |
| Tools missing in OpenCode | `opencode mcp list`; check absolute `--directory`; re-run `uv sync`; restart OpenCode; bump `timeout` to 30000. |
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
and MCP registration via in-memory `Client(mcp)`. Fixtures are synthetic —
never commit private materials (see `.gitignore`: course PDFs are excluded).

## Contributing

Open an issue or pull request at
https://github.com/mo22zy2/Sentra-MCP with your OS, Python version, the
command you ran, and the full error message. Never attach private course
materials.
