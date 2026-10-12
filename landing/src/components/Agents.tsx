import { motion } from "motion/react";
import { Download, ExternalLink } from "lucide-react";
import { AGENT_CARDS } from "../config";
import { useLang } from "../i18n";
import { staggerChild, staggerParent } from "../motion/variants";
import { Section } from "./Section";

/** Agent picker: download links + one-line setup per supported AI agent.
 *  All URLs and config formats verified against official docs (see
 *  src/sentra/agents.py). */
export function Agents() {
  const { t } = useLang();
  return (
    <Section id="agents" eyebrow={t.agents.eyebrow} title={t.agents.title} muted>
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {AGENT_CARDS.map((agent, i) => (
          <motion.article
            key={agent.id}
            variants={staggerChild}
            className="flex flex-col rounded-2xl border border-line bg-white p-6 transition-colors hover:border-sky"
          >
            <h3 className="font-display text-lg font-bold text-navy">{agent.name}</h3>
            <p className="mt-1.5 flex-1 text-[15px] leading-relaxed text-muted">{t.agents.blurbs[i]}</p>
            <div dir="ltr" className="code-ltr mt-4 overflow-hidden rounded-xl bg-ink px-3 py-2.5 font-mono text-[12.5px] text-white">
              <span className="text-sky">$ </span>
              {agent.setup}
            </div>
            <div className="mt-4 flex items-center gap-3 text-sm font-semibold">
              <a
                href={agent.download}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-sun px-4 py-2 text-ink transition-transform hover:-translate-y-0.5"
              >
                <Download className="h-4 w-4" /> {t.agents.download}
              </a>
              <a
                href={agent.docs}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-navy underline"
              >
                {t.agents.docs} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </Section>
  );
}
