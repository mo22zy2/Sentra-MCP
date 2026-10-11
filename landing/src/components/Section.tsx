import { motion } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp } from "../motion/variants";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-display text-sm font-semibold tracking-wide text-navy uppercase">
      <span className="me-2 inline-block h-2 w-6 rounded-full bg-sun align-middle" aria-hidden="true" />
      {children}
    </p>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  children,
  muted = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <section id={id} className={muted ? "bg-mist/60" : "bg-white"}>
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold text-ink sm:text-4xl">{title}</h2>
        </motion.div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className="flex items-center gap-2.5" aria-label="Sentra — سنترا">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#FFD43B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="12" height="15" rx="1.5" fill="#fff" stroke="#FFD43B" />
          <path d="M7 7h6M7 10h6" stroke="#173B72" />
          <path d="M11 15l2.5 2.5L19 12" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-xl font-bold text-navy">
          Sentra <span className="font-body font-semibold text-muted">· سنترا</span>
        </span>
      )}
    </a>
  );
}
