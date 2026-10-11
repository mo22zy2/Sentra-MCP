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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    setVisible(0);
    setStarted(false);
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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const replay = () => {
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
            <button onClick={replay} className="flex items-center gap-1 text-xs font-semibold text-navy hover:underline">
              <RotateCcw className="h-3.5 w-3.5" /> {t.demo.replay}
            </button>
          </div>
        </div>
        <div className="space-y-4 p-5 sm:p-6" aria-live="polite">
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
                key={`${lang}-${i}`}
                initial={reduced ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
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
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="ms-11 rounded-2xl border-2 border-sun bg-sun-soft/60 px-4 py-3 font-mono text-[13px] text-ink"
              dir="ltr"
            >
              ✓ {t.demo.done}
            </motion.div>
          )}
        </div>
      </motion.div>
    </Section>
  );
}
