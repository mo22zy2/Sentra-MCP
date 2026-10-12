import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, ExternalLink, Wrench, Zap } from "lucide-react";
import { AGENT_CARDS, FOLDER_TREE, INSTALL_COMMANDS, MCP_SDK_URL, OPENCODE_CONFIG_JSON, OPENCODE_DOCS_URL } from "../config";
import { useLang } from "../i18n";
import { fadeUp } from "../motion/variants";
import { CodeBlock, InlineCopy } from "./CodeBlock";
import { Section } from "./Section";

export function Install() {
  const { t, lang } = useLang();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"fast" | "nerd">("fast");
  const total = t.install.steps.length;
  const rtl = lang === "ar";

  const go = (d: number) => setStep((s) => Math.min(total - 1, Math.max(0, s + d)));
  const Next = rtl ? ArrowLeft : ArrowRight;
  const Prev = rtl ? ArrowRight : ArrowLeft;

  return (
    <Section id="install" eyebrow={t.install.eyebrow} title={t.install.title} muted>
      {/* fast / nerd chooser */}
      <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label={t.install.title}>
        {(["fast", "nerd"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`flex items-center gap-2 rounded-xl border-2 px-5 py-2.5 text-[15px] font-bold transition-colors ${
              mode === m ? "border-navy bg-navy text-white" : "border-line bg-white text-muted hover:border-sky"
            }`}
          >
            {m === "fast" ? <Zap className="h-4 w-4 text-sun" /> : <Wrench className="h-4 w-4" />}
            {m === "fast" ? t.install.modeFast : t.install.modeNerd}
          </button>
        ))}
        <span className="text-sm text-muted">{t.install.modeHint}</span>
      </div>

      {mode === "fast" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border-2 border-sun bg-sun-soft/40 p-6 sm:p-8"
        >
          <ol className="space-y-2.5">
            {t.quickstart.journey.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-[15.5px] leading-relaxed text-ink">
                <span className="font-display grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ol>
          <a
            href="#quickstart"
            className="font-display mt-6 inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3 font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            <Zap className="h-4 w-4 text-sun" /> {t.install.goQuick}
          </a>
        </motion.div>
      )}

      {mode === "nerd" && (
      <>
      {/* step indicator — listbox style with aria-current, keyboard native */}
      <ol className="mb-8 flex flex-wrap items-center gap-2" aria-label={t.install.title}>
        {t.install.steps.map((s, i) => (
          <li key={i}>
          <button
            onClick={() => setStep(i)}
            aria-current={step === i ? "step" : undefined}
            className={`flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
              step === i
                ? "border-navy bg-navy text-white"
                : i < step
                  ? "border-sky bg-mist text-navy"
                  : "border-line bg-white text-muted hover:border-sky"
            }`}
          >
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                step === i ? "bg-sun text-ink" : "bg-line text-ink"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span className="hidden sm:inline">{s.title}</span>
          </button>
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="lg:col-span-3"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-line bg-white p-6 sm:p-8"
            >
              <p className="text-sm font-semibold text-navy">
                {t.install.nav.stepOf} {step + 1} / {total}
              </p>
              <h3 className="font-display mt-2 text-2xl font-bold text-navy">{t.install.steps[step].title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{t.install.steps[step].body}</p>

              <div className="mt-6 space-y-4">
                {step === 1 && (
                  <div className="rounded-xl border border-line bg-mist/50 p-4 sm:p-5">
                    <p className="font-display font-bold text-navy">{t.install.agentTitle}</p>
                    <p className="mt-1 text-sm text-muted">{t.install.agentHint}</p>
                    <ul className="mt-4 space-y-3">
                      {AGENT_CARDS.map((agent, i) => (
                        <li key={agent.id} className="rounded-xl border border-line bg-white p-4">
                          <p className="font-semibold text-ink">
                            {agent.name} <span className="font-normal text-muted">— {t.install.agentBlurbs[i]}</span>
                          </p>
                          <div dir="ltr" className="code-ltr mt-2 overflow-x-auto rounded-lg bg-ink px-3 py-2 font-mono text-[12.5px] text-white">
                            <span className="text-sky">$ </span>
                            {agent.setup}
                          </div>
                          <p className="mt-2 flex items-center gap-4 text-sm font-semibold">
                            <a href={agent.download} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-navy underline">
                              <Download className="h-3.5 w-3.5" /> {t.install.download}
                            </a>
                            <a href={agent.docs} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-navy underline">
                              {t.install.docs} <ExternalLink className="inline h-3.5 w-3.5" />
                            </a>
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {step === 2 && (
                  <>
                    <CodeBlock label="terminal — Windows" code={INSTALL_COMMANDS.installUvWin} />
                    <CodeBlock label="terminal — otherwise" code={INSTALL_COMMANDS.installUvAlt} />
                    <CodeBlock label="terminal" code={INSTALL_COMMANDS.init} />
                  </>
                )}
                {step === 3 && <CodeBlock label="opencode.json" code={OPENCODE_CONFIG_JSON} />}
                {step === 4 && <CodeBlock label="folder structure" code={FOLDER_TREE} />}
                {step === 5 && (
                  <>
                    <div dir="ltr" className="code-ltr rounded-xl border border-line bg-mist/70 p-4 text-left text-[15px] text-ink">
                      {t.install.firstRunPrompt}
                      <InlineCopy text={t.install.firstRunPrompt} />
                    </div>
                  </>
                )}
                {step === 6 && (
                  <ul className="space-y-3">
                    {t.install.troubleshooting.map((item, i) => (
                      <li key={i} className="rounded-xl border border-line p-4">
                        <code dir="ltr" className="code-ltr font-mono text-[13px] font-semibold text-navy">
                          {item.s}
                        </code>
                        <p className="mt-1.5 text-[15px] text-muted">{item.f}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => go(-1)}
                  disabled={step === 0}
                  className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-line px-5 py-3 text-sm font-semibold text-navy disabled:opacity-40"
                >
                  <Prev className="h-4 w-4" /> {t.install.nav.prev}
                </button>
                <button
                  onClick={() => go(1)}
                  disabled={step === total - 1}
                  className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
                >
                  {t.install.nav.next} <Next className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
          <p className="mt-4 text-sm text-muted">
            {t.install.docsNote}{" "}
            <a href={OPENCODE_DOCS_URL} target="_blank" rel="noreferrer" className="font-semibold text-navy underline">
              {t.install.opencodeDocs} <ExternalLink className="inline h-3.5 w-3.5" />
            </a>{" "}
            ·{" "}
            <a href={MCP_SDK_URL} target="_blank" rel="noreferrer" className="font-semibold text-navy underline">
              {t.install.mcpSdk} <ExternalLink className="inline h-3.5 w-3.5" />
            </a>
          </p>
        </motion.div>

        {/* success checklist */}
        <aside className="lg:col-span-2">
          <div className="rounded-2xl border-2 border-navy bg-white p-6 lg:sticky lg:top-24">
            <h3 className="font-display text-lg font-bold text-navy">{t.install.checklistTitle}</h3>
            <Checklist items={t.install.checklist} />
          </div>
        </aside>
      </div>
      </>)}
    </Section>
  );
}

function Checklist({ items }: { items: string[] }) {
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  // Reset when language changes and item count differs (labels re-render).
  const [prevLen, setPrevLen] = useState(items.length);
  if (items.length !== prevLen) {
    setPrevLen(items.length);
    setDone(items.map(() => false));
  }
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item, i) => (
        <li key={i}>
          <button
            onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
            aria-pressed={done[i] ?? false}
            className={`flex min-h-[44px] w-full items-start gap-2.5 rounded-xl border p-3.5 text-start text-[14.5px] transition-colors ${
              done[i] ? "border-sky bg-mist" : "border-line hover:border-sky"
            }`}
          >
            <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${done[i] ? "text-navy" : "text-line"}`} aria-hidden="true" />
            <span className={done[i] ? "text-navy" : "text-ink"}>{item}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
