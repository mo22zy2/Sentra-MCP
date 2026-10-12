import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useLang } from "../i18n";

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    setFailed(false);
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (!ok) {
          setFailed(true);
          return;
        }
      } catch {
        setFailed(true);
        return;
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-ink" dir="ltr">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="font-mono text-xs text-white/60">{label ?? "terminal"}</span>
        <button
          onClick={copy}
          className="flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-white/20"
          role="status"
          aria-live="polite"
          aria-label={failed ? "Copy failed — select text manually" : t.install.copy}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-sun" /> : <Copy className="h-3.5 w-3.5" />}
          {failed ? "Copy failed" : copied ? t.install.copied : t.install.copy}
        </button>
      </div>
      <pre className="code-ltr overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function InlineCopy({ text }: { text: string }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <button
      onClick={async () => {
        setFailed(false);
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          setFailed(true);
        }
      }}
      className="ms-2 inline-flex min-h-[44px] items-center gap-1 rounded-md border border-line bg-white px-3 py-2 font-mono text-xs text-navy transition-colors hover:border-sky"
      role="status"
      aria-live="polite"
      title={failed ? "Copy failed — select text manually" : t.install.copy}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {failed ? "Copy failed" : copied ? t.install.copied : t.install.copy}
    </button>
  );
}
