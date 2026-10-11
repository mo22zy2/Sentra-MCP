# Sentra landing page (public site, not the exam app)

Bilingual (EN / Egyptian Arabic) product + docs site for the Sentra MCP server.
Lives in `landing/` so the Python MCP project at the repo root stays untouched.

## Run

```bash
cd landing
npm install
npm run dev      # local preview
npm run build    # production build → dist/
```

## Notes

- `src/config.ts` — `GITHUB_URL` is the single source of truth for the repo
  link (currently `https://github.com/mo22zy2/Sentra-MCP`). The bootstrap
  prompt (`BOOTSTRAP_PROMPT`) injects it automatically. Never hardcode the
  URL elsewhere.
- Install commands and the OpenCode JSON mirror the root `README.md` and
  `opencode.jsonc.example` verbatim. If those change, update `src/config.ts`.
- Stack: React + TypeScript + Tailwind v4 (`@tailwindcss/vite`) + motion +
  lucide-react. No router (anchor navigation, single page).
