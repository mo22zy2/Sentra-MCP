import { motion } from "motion/react";
import { FileText, KeyRound, Laptop, ScanSearch, Sparkles } from "lucide-react";
import { useLang } from "../i18n";
import { staggerChild, staggerParent } from "../motion/variants";
import { Section } from "./Section";

const ICONS = [FileText, ScanSearch, Sparkles, KeyRound, Laptop];

export function Features() {
  const { t } = useLang();
  return (
    <Section id="features" eyebrow={t.features.eyebrow} title={t.features.title}>
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {t.features.cards.map((card, i) => {
          const Icon = ICONS[i % ICONS.length];
          const highlight = i === 2;
          return (
            <motion.article
              key={i}
              variants={staggerChild}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className={`rounded-2xl border bg-white p-6 transition-colors ${
                highlight ? "border-navy shadow-[0_8px_30px_-12px_rgba(23,59,114,0.35)]" : "border-line hover:border-sky"
              }`}
            >
              <div
                className={`inline-grid h-11 w-11 place-items-center rounded-xl ${
                  highlight ? "bg-sun" : "bg-mist"
                }`}
              >
                <Icon className="h-5 w-5 text-navy" aria-hidden="true" />
              </div>
              <h3 className="font-display mt-4 text-lg font-bold text-ink">{card.title}</h3>
              <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-muted">
                {card.points.map((p, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-navy" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.article>
          );
        })}
        {/* sixth tile: honesty note keeps grid balanced */}
        <motion.a
          variants={staggerChild}
          href="#faq"
          className="flex flex-col justify-between rounded-2xl border-2 border-dashed border-line bg-mist/50 p-6 transition-colors hover:border-navy"
        >
          <p className="font-display text-lg font-bold text-navy">{t.features.honest.title}</p>
          <p className="mt-2 text-[15px] text-muted">{t.features.honest.body}</p>
        </motion.a>
      </motion.div>
    </Section>
  );
}
