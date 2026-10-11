import { motion } from "motion/react";
import { Lock, Zap } from "lucide-react";
import { BOOTSTRAP_PROMPT } from "../config";
import { useLang } from "../i18n";
import { fadeUp } from "../motion/variants";
import { CodeBlock } from "./CodeBlock";
import { Section } from "./Section";

/** Zero-setup entry: a copy-paste prompt that lets the OpenCode agent do the
 *  whole installation + configuration on the student's own machine. Rendered
 *  BEFORE the manual install steps; the steps below stay untouched. */
export function QuickStart() {
  const { t } = useLang();
  return (
    <Section id="quickstart" eyebrow={t.quickstart.eyebrow} title={t.quickstart.title}>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-6 lg:grid-cols-5 lg:items-start"
      >
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 rounded-2xl border-2 border-sun bg-sun-soft/60 p-5">
            <Zap className="h-6 w-6 shrink-0 text-navy" aria-hidden="true" />
            <p className="text-[15.5px] leading-relaxed text-ink">{t.quickstart.body1}</p>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-line bg-mist/60 p-5">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
            <p className="text-[15px] leading-relaxed text-muted">{t.quickstart.body2}</p>
          </div>
        </div>
        <div className="lg:col-span-3">
          <CodeBlock label={t.quickstart.promptLabel} code={BOOTSTRAP_PROMPT} />
        </div>
      </motion.div>
    </Section>
  );
}
