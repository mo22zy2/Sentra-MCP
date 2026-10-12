import { motion } from "motion/react";
import { Link2, Lock } from "lucide-react";
import { AGENT_SENTENCE, GITHUB_URL } from "../config";
import { useLang } from "../i18n";
import { fadeUp, staggerChild, staggerParent } from "../motion/variants";
import { CodeBlock } from "./CodeBlock";
import { Section } from "./Section";

/** Link-first journey: copy the repo link, paste it into OpenCode with one
 *  sentence, restart, drop files, ask for exams. Rendered BEFORE the manual
 *  install steps; the steps below stay untouched. */
export function QuickStart() {
  const { t } = useLang();
  return (
    <Section id="quickstart" eyebrow={t.quickstart.eyebrow} title={t.quickstart.title}>
      <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
        <motion.ol
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-3 lg:col-span-2"
        >
          {t.quickstart.journey.map((step, i) => (
            <motion.li
              key={i}
              variants={staggerChild}
              className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4"
            >
              <span className="font-display grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="pt-1 text-[15px] leading-relaxed text-ink">{step}</span>
            </motion.li>
          ))}
        </motion.ol>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-4 lg:col-span-3"
        >
          <CodeBlock label={t.quickstart.linkLabel} code={GITHUB_URL} />
          <CodeBlock label={t.quickstart.sayLabel} code={AGENT_SENTENCE} />
          <div className="flex items-start gap-2 rounded-2xl border border-line bg-mist/60 p-5">
            <span className="flex items-center gap-2">
              <Link2 className="h-5 w-5 shrink-0 text-sky" aria-hidden="true" />
              <Lock className="h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
            </span>
            <p className="text-[15px] leading-relaxed text-muted">{t.quickstart.note}</p>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
