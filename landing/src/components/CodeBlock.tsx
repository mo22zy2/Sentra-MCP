import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useLang } from "../i18n";

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
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
          className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 font-mono text-xs text-white transition-colors hover:bg-white/20"
          aria-live="polite"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-sun" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? t.install.copied : t.install.copy}
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
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="ms-2 inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-0.5 font-mono text-xs text-navy transition-colors hover:border-sky"
      aria-live="polite"
      title={t.install.copy}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? t.install.copied : t.install.copy}
    </button>
  );
}
