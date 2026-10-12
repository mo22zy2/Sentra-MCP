# Sentra: mock exams from your PDFs (free, open-source MCP server)

Sentra turns lecture PDFs and past exams into realistic mock exams with
answer keys. It runs on your machine, costs nothing, and works with any
MCP-compatible AI agent (OpenCode, Claude Code, Cursor, VS Code, Gemini CLI).

Your agent does the thinking; Sentra does the reading, the analysis prep,
and the file saving. Sentra itself makes no model calls.

Bilingual site + docs: [`landing/`](landing/) (English / Egyptian Arabic).

## Quick start

1. In your AI agent, paste `https://github.com/mo22zy2/Sentra-MCP` and say: `download and run this mcp`
2. Restart your agent so the sentra tools appear.
3. Drop lecture PDFs into `lectures/` and past exams into `past_exams/`.
4. Say `run the sentra pipeline`, or `make me 2 exams using the sentra mcp`.

The pipeline runs the prompts in order
(`extract_text → knowledge_base → professor_dna → exam_targets → predicted_exam`)
and saves each `.md` under `output/`.

**Terminal install:** get `uv` (Windows: `winget install -e --id astral-sh.uv`,
otherwise `pip install uv`), then run `uvx sentra-mcp init`. It creates the
course folder and connects your agent, backing up its config first. For
another agent: `uvx sentra-mcp init --agent <claude|cursor|vscode|gemini>`.

## Your folders

```
<the folder you opened in your agent>/
├── lectures/     # lecture PDFs
├── past_exams/   # previous exam PDFs
└── output/       # generated .md files
```

PDF only. Scanned/image PDFs are flagged, not transcribed (no OCR); use a text-based export.

## Prompts (5) + Tools (9)

Prompts are the core and run in order. Tools only supply evidence.

| Name | What it does |
|---|---|
| `extract_text` | Step 1: how to read every PDF faithfully. |
| `knowledge_base` | Step 2: writes `output/knowledge_base.md` from lectures. |
| `professor_dna` | Step 3: writes `output/professor_dna.md` from past exams. |
| `exam_targets` | Step 4: writes `output/exam_targets.md` from the two above. |
| `predicted_exam` | Step 5: writes `output/predicted_exam.md` from the three above. |
| `start_pipeline` | File listing + ordered steps + step-1 prompt in one call. |
| `list_workflow_prompts` | Ordered prompt list with output files. |
| `get_workflow_prompt` | One prompt verbatim + `writes`/`next`. |
| `save_pipeline_file` | Saves the pipeline `.md` files. Schemaless: only checks name, non-empty, 1MB cap, no silent overwrite. |
| `list_course_pdfs` | Lists PDFs, reports unreadable files. |
| `extract_pdf_text` | Page-numbered text (50 pages / 60k chars per call). Scanned PDFs return `insufficient_text`. |
| `analyze_past_exams` | Counts + `file:page` cites for `professor_dna`. |
| `prepare_exam_brief` | Evidence for mock-exam writing. |
| `save_exam_files` | Saves exam + separate answer key; refuses silent overwrites. |

Prompt text is also available as the `prompt://{name}` resource.

## Privacy & limits

- Everything is processed and saved locally; Sentra uploads nothing. If your
  agent's model is cloud-hosted, what you ask about goes to that provider.
- 50 MB per file. All paths stay inside the course folder (`../` rejected).
- PDFs are treated as untrusted data.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `No PDFs listed` | Put files in `lectures/` or `past_exams/` inside the opened folder. |
| Tools missing in your agent | Restart it. Still missing? Re-run `init`. |
| `... must sum to 100` | Difficulty `{easy,medium,hard}` must total exactly 100. |
| `Refusing to overwrite` | Use a new `basename` or `overwrite: true`. |
| `insufficient_text: true` | Scanned PDF; use a text-based export. |

## Developers

```bash
git clone https://github.com/mo22zy2/Sentra-MCP.git
cd Sentra-MCP
uv sync            # Python 3.11+ and uv
uv run pytest -q
```

Manual config: [`opencode.jsonc.example`](opencode.jsonc.example). From source use
`["uv", "--directory", "<ABSOLUTE_REPO_PATH>", "run", "sentra"]`.
Issues/PRs: include OS, Python version, command, and full error. Never attach private course materials.

## For AI agents: bootstrap contract

Do everything yourself. Never ask the student to run commands or edit files.
NEVER upload their files anywhere.

1. Install with `uvx sentra-mcp init`. If that fails, clone, `uv sync`, `uv run pytest -q`.
2. Configure with `init --agent <id>` if the user named an agent, else default `init`.
3. Course folder = the opened folder. Tell the user where to drop PDFs, in their language.
4. Verify with `list_workflow_prompts` (5 prompts), then tell the user to RESTART their agent.
5. Run `start_pipeline`, then the prompts in order, saving each with `save_pipeline_file`.
   For each mock exam: `prepare_exam_brief`, write original questions only (never copy
   past exams), then `save_exam_files` with a DIFFERENT basename per exam. Answer keys
   stay in separate `*_answers.md` files.
