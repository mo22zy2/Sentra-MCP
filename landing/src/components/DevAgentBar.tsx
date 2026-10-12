import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";
import { AGENT_CARDS } from "../config";

/**
 * DEV ONLY agent theme switcher. Rendered exclusively when
 * `import.meta.env.DEV` is true (`npm run dev`); the production build
 * (`npm run build`) replaces it with `false` and tree-shakes this whole
 * component out — verify with: no "sentra-dev-agent" string in dist/.
 * Picking an agent sets `data-agent` on <html>; see index.css overrides.
 */
const STORAGE_KEY = "sentra-dev-agent";

export function DevAgentBar() {
  if (!import.meta.env.DEV) return null;
  return <DevAgentBarInner />;
}

function DevAgentBarInner() {
  const [agent, setAgent] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "sentra";
    } catch {
      return "sentra";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.agent = agent;
    try {
      localStorage.setItem(STORAGE_KEY, agent);
    } catch {
      /* ignore */
    }
  }, [agent]);

  return (
    <div
      className="fixed bottom-3 left-1/2 z-[60] flex max-w-[95vw] -translate-x-1/2 flex-wrap items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-red-500 bg-white/95 px-3 py-2 font-mono text-xs shadow-xl backdrop-blur"
      role="toolbar"
      aria-label="DEV ONLY agent theme preview"
    >
      <span className="flex items-center gap-1 font-bold text-red-600">
        <FlaskConical className="h-3.5 w-3.5" /> DEV ONLY
      </span>
      {["sentra", ...AGENT_CARDS.map((a) => a.id)].map((id) => (
        <button
          key={id}
          onClick={() => setAgent(id)}
          aria-pressed={agent === id}
          className={`rounded-lg px-2 py-1 capitalize transition-colors ${
            agent === id ? "bg-ink text-white" : "bg-line/60 text-ink hover:bg-line"
          }`}
        >
          {id}
        </button>
      ))}
    </div>
  );
}
