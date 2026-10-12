import { motion } from "motion/react";
import { Bug, Lightbulb, GitPullRequest } from "lucide-react";
import { GITHUB_URL } from "../config";
import { useLang } from "../i18n";
import { staggerChild, staggerParent } from "../motion/variants";
import { Section } from "./Section";

const ICONS = [Bug, Lightbulb, GitPullRequest];
const HREFS = [`${GITHUB_URL}/issues`, `${GITHUB_URL}/issues/new`, `${GITHUB_URL}/pulls`];

/** Contributions welcome: report bugs, suggest features, open PRs. */
export function Contribute() {
  const { t } = useLang();
  return (
    <Section id="contribute" eyebrow={t.contribute.eyebrow} title={t.contribute.title}>
      <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-muted">{t.contribute.body}</p>
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-3"
      >
        {t.contribute.cards.map((card, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <motion.a
              key={i}
              variants={staggerChild}
              href={HREFS[i]}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-line bg-white p-6 transition-all hover:-translate-y-1 hover:border-sky"
            >
              <span className="inline-grid h-12 w-12 place-items-center rounded-2xl border-2 border-navy bg-mist">
                <Icon className="h-6 w-6 text-navy" aria-hidden="true" />
              </span>
              <h3 className="font-display mt-4 font-bold text-ink">{card.t}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{card.b}</p>
            </motion.a>
          );
        })}
      </motion.div>
      <div className="mx-auto mt-8 max-w-4xl rounded-2xl border-2 border-navy bg-white p-6">
        <h3 className="font-display text-lg font-bold text-navy">{t.contribute.rulesTitle}</h3>
        <ul className="mt-3 space-y-2.5">
          {t.contribute.rules.map((rule, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-ink">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sun text-xs font-bold text-ink">
                {i + 1}
              </span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
