import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Bot, CheckCircle2, Loader2, RotateCcw, User } from "lucide-react";
import { useLang } from "../i18n";
import { fadeUp } from "../motion/variants";
import { Section } from "./Section";

export function DemoChat() {
  const { t, lang } = useLang();
  const [visible, setVisible] = useState(0);
  const [started, setStarted] = useState(false);
  const [reduced, setReduced] = useState(false);
  // Bumped on every replay (and language change) so step rows remount and
  // their enter animation actually replays instead of rendering instantly.
  const [runId, setRunId] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Restart the sequence on language change. If the demo is already on
  // screen, start immediately; otherwise the live observer below fires
  // when it scrolls into view. No page reload ever needed.
  useEffect(() => {
    setVisible(0);
    setRunId((id) => id + 1);
    const el = ref.current;
    if (!el) {
      setStarted(false);
      return;
    }
    const r = el.getBoundingClientRect();
    setStarted(r.top < window.innerHeight && r.bottom > 0);
  }, [lang]);

  useEffect(() => {
    if (!started) return;
    if (reduced) {
      setVisible(t.demo.steps.length + 1);
      return;
    }
    if (visible > t.demo.steps.length) return;
    const id = setTimeout(() => setVisible((v) => v + 1), visible === 0 ? 600 : 1100);
    return () => clearTimeout(id);
  }, [started, visible, reduced, t.demo.steps.length]);

  // One permanent observer for the component lifetime: it fires whenever
  // the demo scrolls into view (first visit AND after language toggles).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const replay = () => {
    setRunId((id) => id + 1);
    setVisible(0);
    setStarted(true);
  };

  return (
    <Section id="demo" eyebrow={t.demo.eyebrow} title={t.demo.title}>
      <motion.div
        ref={ref}
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-line bg-white shadow-[0_20px_60px_-30px_rgba(23,59,114,0.35)]"
      >
        <div className="flex items-center justify-between border-b border-line bg-mist/70 px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-navy">
            <Bot className="h-4 w-4" /> OpenCode · sentra
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-sun-soft px-2.5 py-1 text-xs font-semibold text-ink">
              {t.demo.illustrative}
            </span>
            <button onClick={replay} className="flex min-h-[44px] min-w-[44px] items-center gap-1 px-2 py-2 text-xs font-semibold text-navy hover:underline">
              <RotateCcw className="h-3.5 w-3.5" /> {t.demo.replay}
            </button>
          </div>
        </div>
        <div className="space-y-4 p-5 sm:p-6" aria-live="off">
          <div className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist">
              <User className="h-4 w-4 text-navy" />
            </span>
            <p className="rounded-2xl bg-mist px-4 py-3 text-[15px] leading-relaxed text-ink">
              {t.demo.prompt}
            </p>
          </div>
          {t.demo.steps.slice(0, visible).map((s, i) => {
            const done = i < visible - 1 || visible > t.demo.steps.length;
            const last = i === visible - 1 && visible <= t.demo.steps.length;
            return (
              <motion.div
                key={`${lang}-${runId}-${i}`}
                initial={reduced ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 ps-11 text-[15px] text-muted"
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-sky" aria-hidden="true" />
                ) : (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-navy" aria-hidden="true" />
                )}
                <span className={last && !done ? "text-ink" : ""}>
                  {s}
                  {last && !done ? "…" : ""}
                </span>
              </motion.div>
            );
          })}
          {visible > t.demo.steps.length && (
            <motion.div
              key={`${lang}-${runId}-done`}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="code-ltr ms-11 rounded-2xl border-2 border-sun bg-sun-soft/60 px-4 py-3 font-mono text-[13px] text-ink"
              dir="ltr"
              role="status"
              aria-live="polite"
            >
              ✓ {t.demo.done}
            </motion.div>
          )}
        </div>
      </motion.div>
    </Section>
  );
}
