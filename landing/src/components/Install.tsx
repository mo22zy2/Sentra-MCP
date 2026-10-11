import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { FOLDER_TREE, INSTALL_COMMANDS, MCP_SDK_URL, OPENCODE_CONFIG_JSON, OPENCODE_DOCS_URL } from "../config";
import { useLang } from "../i18n";
import { fadeUp } from "../motion/variants";
import { CodeBlock, InlineCopy } from "./CodeBlock";
import { Section } from "./Section";

export function Install() {
  const { t, lang } = useLang();
  const [step, setStep] = useState(0);
  const total = t.install.steps.length;
  const rtl = lang === "ar";

  const go = (d: number) => setStep((s) => Math.min(total - 1, Math.max(0, s + d)));
  const Next = rtl ? ArrowLeft : ArrowRight;
  const Prev = rtl ? ArrowRight : ArrowLeft;

  return (
    <Section id="install" eyebrow={t.install.eyebrow} title={t.install.title} muted>
      {/* step indicator */}
      <div className="mb-8 flex flex-wrap items-center gap-2" role="tablist" aria-label={t.install.title}>
        {t.install.steps.map((s, i) => (
          <button
            key={s.title}
            role="tab"
            aria-selected={step === i}
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
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
            <span className="hidden lg:inline">{s.title}</span>
          </button>
        ))}
      </div>

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
              key={`${lang}-${step}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-line bg-white p-6 sm:p-8"
            >
              <p className="text-sm font-semibold text-sky">
                {t.install.nav.stepOf} {step + 1} / {total}
              </p>
              <h3 className="font-display mt-2 text-2xl font-bold text-navy">{t.install.steps[step].title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{t.install.steps[step].body}</p>

              <div className="mt-6 space-y-4">
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
                    <div className="rounded-xl border border-line bg-mist/70 p-4 text-[15px] text-ink">
                      {t.install.firstRunPrompt}
                      <InlineCopy text={t.install.firstRunPrompt} />
                    </div>
                  </>
                )}
                {step === 6 && (
                  <ul className="space-y-3">
                    {t.install.troubleshooting.map((item) => (
                      <li key={item.s} className="rounded-xl border border-line p-4">
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
                  className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-navy disabled:opacity-40"
                >
                  <Prev className="h-4 w-4" /> {t.install.nav.prev}
                </button>
                <button
                  onClick={() => go(1)}
                  disabled={step === total - 1}
                  className="flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
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
    </Section>
  );
}

function Checklist({ items }: { items: string[] }) {
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item, i) => (
        <li key={item}>
          <button
            onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
            aria-pressed={done[i]}
            className={`flex w-full items-start gap-2.5 rounded-xl border p-3 text-start text-[14.5px] transition-colors ${
              done[i] ? "border-sky bg-mist" : "border-line hover:border-sky"
            }`}
          >
            <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${done[i] ? "text-navy" : "text-line"}`} aria-hidden="true" />
            <span className={done[i] ? "text-navy line-through" : "text-ink"}>{item}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
