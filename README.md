# Sentra — mock exams from your PDFs (free, open-source MCP server)

Sentra turns lecture PDFs and past exams into realistic mock exams with
answer keys. It runs on your machine, costs nothing, and works with any
MCP-compatible AI agent (OpenCode, Claude Code, Cursor, VS Code, Gemini CLI).

Your agent does the thinking; Sentra does the reading, the analysis prep,
and the file saving. Sentra itself makes no model calls.

Bilingual site + docs: [`landing/`](landing/) (English / Egyptian Arabic).

## Fastest start

1. Copy this repo link: `https://github.com/mo22zy2/Sentra-MCP`
2. In your AI agent, paste it and say: `download and run this mcp`
3. Restart your agent so the sentra tools appear.
4. Drop lecture PDFs into `lectures/` and past exams into `past_exams/`.
5. Say: `make me 2 exams using the sentra mcp` — collect both exams and both answer keys from `output/`.

Not on OpenCode? `uvx sentra-mcp init --agent <claude|cursor|vscode|gemini>`
writes the right config for your agent. Every agent uses the same local
`lectures/`, `past_exams/`, `output/` folders.

## Prefer the terminal?

Install `uv` once (Windows: `winget install -e --id astral-sh.uv`,
otherwise: `pip install uv`), then:

```bash
uvx sentra-mcp init
```

`init` creates your course folder, connects your agent (backing up its
config first), and tells you where to drop PDFs. Then ask your agent:

- "Analyze the previous exams and summarize the professor's question patterns."
- "Generate a two-hour Operating Systems mock exam with an answer key."

You get `output/<name>_exam.md` + `output/<name>_answers.md`, saved locally.

## Your folders

```
<the folder you opened in your agent>/
├── lectures/     # lecture PDFs (auto-created)
├── past_exams/   # previous exam PDFs (auto-created)
└── output/       # generated *_exam.md + *_answers.md (auto-created)
```

PDF only in this version. Scanned/image PDFs are flagged instead of
silently returning nothing — OCR is out of scope, use a text-based export.

## Tools (5, all local)

| Tool | What it does |
|---|---|
| `list_course_pdfs` | Lists your PDFs, reports unreadable files. Never leaves the course folder. |
| `extract_pdf_text` | Page-preserving text extraction (50 pages / 60k chars per call). No OCR. |
| `analyze_past_exams` | Question types, patterns, approx difficulty — every finding cites `file:page`. Finds patterns only; never predicts the real exam. |
| `prepare_exam_brief` | Validates your exam spec (difficulty must total 100). The agent writes the questions. |
| `save_exam_files` | Saves exam + separate answer key. Refuses silent overwrites. |

Question types allowed: MCQ, True/False, Short Answer, Essay, Numerical,
Comparison, Diagram, Case Study, Application, Analysis, Problem Solving.

## Privacy & limits

- Everything is processed and saved on your machine; Sentra uploads nothing.
  If your agent's model is cloud-hosted, what you ask about is sent to that
  provider.
- 50 MB per file. All paths stay inside the course folder (`../` rejected).
- PDFs are treated as untrusted data (never executed). No secrets in logs.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `No PDFs listed` | Put files in `lectures/` or `past_exams/` inside the opened folder. |
| Tools missing in your agent | Run its server-list command, then restart it. Still missing? Re-run `init`. |
| `... must sum to 100` | Difficulty `{easy,medium,hard}` must total exactly 100. |
| `Refusing to overwrite` | New `basename` or `overwrite: true`. |
| `insufficient_text: true` | Scanned PDF — use a text-based export. |

## Developers

```bash
git clone https://github.com/mo22zy2/Sentra-MCP.git
cd Sentra-MCP
uv sync   # needs Python 3.11+ and uv
uv run pytest -q   # expect: 42 passed
```

Manual config example: [`opencode.jsonc.example`](opencode.jsonc.example)
(prefer `["uvx", "sentra-mcp"]`; from source use
`["uv", "--directory", "<ABSOLUTE_REPO_PATH>", "run", "sentra"]`).
Contribute via issues/PRs with your OS, Python version, command, and full
error message. Never attach private course materials.

## For AI agents: bootstrap contract (user pasted this repo's link)

Do everything below yourself. Never ask the student to run commands or edit
files. Nothing leaves this machine — NEVER upload their files anywhere.

1. Install: if `uvx sentra-mcp init` works, use it. Otherwise clone, `uv sync`
   (install `uv` first; need Python 3.11+). Verify: `uv run pytest -q`.
2. Configure with `uvx sentra-mcp init --agent <id>` when the user names an
   agent, else default `init` (OpenCode). Manual fallback: the `sentra` block
   from `opencode.jsonc.example` under `mcp` in the agent config.
3. Course folder = the opened folder: `lectures/`, `past_exams/`, `output/`
   (auto-created). Tell the user where to drop PDFs, in their language.
4. Verify the 5 tools respond, then tell the user to RESTART their agent.
5. Per exam: `prepare_exam_brief` with its spec, original questions only
   (never copy past exams), `save_exam_files` with a DIFFERENT basename per
   exam. Answer keys stay in separate `*_answers.md` files.
