import { motion } from "motion/react";
import { BookOpenText, Cpu, FileSearch } from "lucide-react";
import { useLang } from "../i18n";
import { staggerChild, staggerParent } from "../motion/variants";
import { Section } from "./Section";

export function WhatIs() {
  const { t } = useLang();
  return (
    <Section id="what" eyebrow={t.what.eyebrow} title={t.what.title} muted>
      <div className="grid gap-6 lg:grid-cols-5">
        <motion.p
          variants={staggerChild}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="text-lg leading-relaxed text-ink lg:col-span-3"
        >
          {t.what.body}
        </motion.p>
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1"
        >
          <motion.div variants={staggerChild} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center gap-2 font-semibold text-navy">
              <FileSearch className="h-5 w-5 text-sky" /> {t.what.mcpTitle}
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{t.what.mcpBody}</p>
          </motion.div>
          <motion.div variants={staggerChild} className="rounded-2xl border-2 border-sun bg-sun-soft/50 p-5">
            <div className="flex items-center gap-2 font-semibold text-navy">
              <Cpu className="h-5 w-5" /> {t.what.notModelTitle}
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{t.what.notModelBody}</p>
          </motion.div>
        </motion.div>
      </div>
      <div className="mt-6 flex items-center gap-2 text-sm text-muted">
        <BookOpenText className="h-4 w-4 text-sky" aria-hidden="true" />
        <span dir="ltr" className="font-mono text-[13px]">
          lectures/*.pdf → analyze → output/*_exam.md + *_answers.md
        </span>
      </div>
    </Section>
  );
}
