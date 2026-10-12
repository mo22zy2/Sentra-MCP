import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useLang } from "../i18n";
import { staggerChild, staggerParent } from "../motion/variants";

/** Signature illustration: lecture stack + exam sheet → MCP analysis layer → mock exam. */
export function PipelineArt() {
  return (
    <svg
      viewBox="0 0 560 380"
      className="h-auto w-full"
      role="img"
      aria-label="Lecture documents and exam sheets flowing through an AI analysis layer into a generated mock exam"
    >
      {/* lecture stack */}
      <g>
        <rect x="30" y="90" width="130" height="170" rx="10" fill="#fff" stroke="#E5EAF1" strokeWidth="2" transform="rotate(-6 95 175)" />
        <rect x="40" y="80" width="130" height="170" rx="10" fill="#fff" stroke="#173B72" strokeWidth="2.5" />
        <rect x="56" y="102" width="98" height="10" rx="5" fill="#173B72" />
        <rect x="56" y="120" width="98" height="7" rx="3.5" fill="#5BA7E8" />
        <rect x="56" y="135" width="70" height="7" rx="3.5" fill="#E5EAF1" />
        <rect x="56" y="150" width="98" height="7" rx="3.5" fill="#E5EAF1" />
        <rect x="56" y="165" width="80" height="7" rx="3.5" fill="#E5EAF1" />
        <rect x="56" y="196" width="98" height="26" rx="6" fill="#EAF3FF" />
        <rect x="64" y="203" width="60" height="6" rx="3" fill="#5BA7E8" />
        <text x="56" y="72" fontFamily="monospace" fontSize="14" fill="#667085">lectures/</text>
      </g>
      {/* past exam sheet */}
      <g>
        <rect x="60" y="252" width="120" height="80" rx="10" fill="#fff" stroke="#E5EAF1" strokeWidth="2" />
        <rect x="74" y="266" width="60" height="8" rx="4" fill="#173B72" />
        <circle cx="78" cy="290" r="5" fill="none" stroke="#5BA7E8" strokeWidth="2.5" />
        <rect x="90" y="287" width="70" height="6" rx="3" fill="#E5EAF1" />
        <rect x="90" y="300" width="50" height="6" rx="3" fill="#E5EAF1" />
        <rect x="72" y="312" width="34" height="12" rx="6" fill="#FFD43B" />
        <text x="60" y="350" fontFamily="monospace" fontSize="14" fill="#667085">past_exams/</text>
      </g>
      {/* connector into analysis node */}
      <path d="M185 165 C 230 165, 230 190, 262 190" fill="none" stroke="#5BA7E8" strokeWidth="3" strokeDasharray="1 8" strokeLinecap="round" />
      <path d="M185 292 C 225 292, 225 250, 258 240" fill="none" stroke="#5BA7E8" strokeWidth="3" strokeDasharray="1 8" strokeLinecap="round" />
      {/* analysis layer */}
      <g>
        <rect x="262" y="150" width="150" height="140" rx="18" fill="#173B72" />
        <circle cx="337" cy="185" r="16" fill="none" stroke="#FFD43B" strokeWidth="3" />
        <circle cx="337" cy="185" r="5" fill="#FFD43B" />
        <rect x="288" y="214" width="98" height="9" rx="4.5" fill="#fff" opacity="0.9" />
        <rect x="300" y="231" width="74" height="7" rx="3.5" fill="#5BA7E8" />
        <rect x="308" y="246" width="58" height="7" rx="3.5" fill="#fff" opacity="0.55" />
        <text x="287" y="278" fontFamily="monospace" fontSize="13" fill="#FFD43B">mcp · analyze</text>
      </g>
      {/* connector out */}
      <path d="M412 220 C 445 220, 445 220, 462 220" fill="none" stroke="#173B72" strokeWidth="3" strokeLinecap="round" />
      {/* mock exam output */}
      <g className="hero-float">
        <rect x="462" y="60" width="20" height="260" rx="8" fill="#EAF3FF" />
        <rect x="440" y="70" width="90" height="230" rx="10" fill="#fff" stroke="#173B72" strokeWidth="2.5" />
        <rect x="452" y="88" width="66" height="10" rx="5" fill="#173B72" />
        <rect x="452" y="106" width="66" height="6" rx="3" fill="#E5EAF1" />
        <rect x="452" y="118" width="48" height="6" rx="3" fill="#E5EAF1" />
        <rect x="452" y="138" width="66" height="6" rx="3" fill="#E5EAF1" />
        <rect x="452" y="150" width="55" height="6" rx="3" fill="#E5EAF1" />
        <rect x="452" y="170" width="66" height="6" rx="3" fill="#E5EAF1" />
        <rect x="452" y="182" width="40" height="6" rx="3" fill="#E5EAF1" />
        <rect x="452" y="208" width="66" height="30" rx="8" fill="#FFD43B" />
        <path d="M462 223l6 6 12-13" fill="none" stroke="#173B72" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="452" y="252" width="50" height="14" rx="7" fill="#EAF3FF" />
        <text x="440" y="48" fontFamily="monospace" fontSize="14" fill="#667085">output/</text>
      </g>
      <style>{`.hero-float { animation: heroFloat 5s ease-in-out infinite; } @keyframes heroFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } } @media (prefers-reduced-motion: reduce) { .hero-float { animation: none; } }`}</style>
    </svg>
  );
}

export function Hero() {
  const { t } = useLang();
  return (
    <section id="top" className="overflow-hidden bg-white pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-14 pb-16 sm:px-8 lg:grid-cols-2 lg:pt-20">
        <motion.div variants={staggerParent} initial="hidden" animate="show">
          <motion.p
            variants={staggerChild}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-mist px-3.5 py-1.5 text-[13px] font-semibold text-navy"
          >
            <span className="h-2 w-2 rounded-full bg-sky" aria-hidden="true" />
            {t.hero.badge}
          </motion.p>
          <motion.h1
            variants={staggerChild}
            className="font-display mt-5 text-4xl leading-[1.12] font-bold text-ink sm:text-5xl lg:text-[3.4rem]"
          >
            {t.hero.headlineA}
            <br />
            <span className="relative inline-block text-navy">
              {t.hero.headlineB}
              <svg viewBox="0 0 300 16" className="absolute -bottom-6 start-0 w-full overflow-visible" aria-hidden="true" preserveAspectRatio="none">
                <path d="M4 9 C 80 3, 220 3, 296 8" fill="none" stroke="#FFD43B" strokeWidth="4.5" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>
          <motion.p variants={staggerChild} className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            {t.hero.description}
          </motion.p>
          <motion.div variants={staggerChild} className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#install"
              className="font-display inline-flex items-center gap-2 rounded-xl bg-sun px-7 py-3.5 text-lg font-bold text-ink shadow-[0_2px_0_#172033] transition-transform hover:-translate-y-0.5"
            >
              {t.hero.primary}
              <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
            </a>
            <a
              href="#how"
              className="font-display inline-flex items-center gap-2 rounded-xl border-2 border-navy bg-white px-6 py-3 font-semibold text-navy transition-colors hover:bg-mist"
            >
              {t.hero.secondary}
            </a>
          </motion.div>
          <motion.p variants={staggerChild} className="mt-5 text-sm text-muted">
            {t.hero.note}
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-line bg-gradient-to-b from-mist/70 to-white p-4 sm:p-6"
          dir="ltr"
        >
          <PipelineArt />
        </motion.div>
      </div>
    </section>
  );
}
