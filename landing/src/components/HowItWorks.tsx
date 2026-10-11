import { motion } from "motion/react";
import { Download, FileUp, GraduationCap, Plug2, SearchCheck } from "lucide-react";
import { FOLDER_TREE } from "../config";
import { useLang } from "../i18n";
import { staggerChild, staggerParent } from "../motion/variants";
import { Section } from "./Section";

const ICONS = [Download, Plug2, FileUp, SearchCheck, GraduationCap];

export function HowItWorks() {
  const { t } = useLang();
  return (
    <Section id="how" eyebrow={t.how.eyebrow} title={t.how.title} muted>
      <motion.ol
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="relative grid gap-5 md:grid-cols-5"
      >
        {/* connector line (desktop) */}
        <div className="absolute top-7 right-[10%] left-[10%] hidden h-0.5 bg-line md:block rtl:scale-x-[-1]" aria-hidden="true" />
        {t.how.steps.map((step, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <motion.li key={step.title} variants={staggerChild} className="relative">
              <div className="relative z-10 inline-grid h-14 w-14 place-items-center rounded-2xl border-2 border-navy bg-white shadow-[0_3px_0_#FFD43B]">
                <Icon className="h-6 w-6 text-navy" aria-hidden="true" />
                <span className="font-display absolute -top-2.5 -end-2.5 grid h-7 w-7 place-items-center rounded-full bg-navy text-sm font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display mt-4 font-bold text-ink">{step.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{step.body}</p>
            </motion.li>
          );
        })}
      </motion.ol>
      <motion.div
        variants={staggerChild}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-center"
      >
        <div>
          <h3 className="font-display text-xl font-bold text-navy">{t.how.folderTitle}</h3>
          <p className="mt-2 text-muted">lectures/ · past_exams/ · output/</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-ink" dir="ltr">
          <pre className="code-ltr overflow-x-auto p-5 font-mono text-[13.5px] leading-relaxed text-white">
            <code>{FOLDER_TREE}</code>
          </pre>
        </div>
      </motion.div>
    </Section>
  );
}
