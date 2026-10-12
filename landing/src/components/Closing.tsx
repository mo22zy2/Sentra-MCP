import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GITHUB_URL } from "../config";
import { useLang } from "../i18n";
import { fadeUp } from "../motion/variants";
import { GithubCta } from "./Navbar";
import { Logo } from "./Section";

export function FinalCta() {
  const { t } = useLang();
  return (
    <section className="bg-white px-5 pb-20 sm:px-8">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border-2 border-navy bg-sun px-6 py-14 text-center sm:px-12"
      >
        {/* subtle geometric pattern */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-10" aria-hidden="true">
          <defs>
            <pattern id="cta-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="2" fill="#173B72" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>
        <h2 className="font-display relative text-3xl font-bold text-ink sm:text-4xl">{t.cta.title}</h2>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#install"
            className="font-display inline-flex items-center gap-2 rounded-xl bg-navy px-7 py-3.5 text-lg font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            {t.cta.primary}
            <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </a>
          <span className="[&>a]:border-navy [&>span]:border-navy">
            <GithubCta variant="cta" />
          </span>
        </div>
      </motion.div>
    </section>
  );
}

export function Footer() {
  const { t } = useLang();
  const ready = GITHUB_URL.length > 0;
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-muted">{t.footer.tagline}</p>
        </div>
        <nav className="flex flex-col gap-2.5 text-[15px] font-medium" aria-label="Footer">
          <a href="#install" className="text-navy hover:underline">
            {t.footer.install}
          </a>
          {ready ? (
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-navy hover:underline">
              {t.footer.github}
            </a>
          ) : (
            <span className="text-muted" title={t.nav.githubSoon}>
              {t.footer.github} · {t.nav.githubSoon.split("—")[0]}
            </span>
          )}
          {ready ? (
            <a href={`${GITHUB_URL}/pulls`} target="_blank" rel="noreferrer" className="text-navy hover:underline">
              {t.footer.contribute}
            </a>
          ) : (
            <span className="text-muted">{t.footer.contribute}</span>
          )}
          <a href="mailto:moja3222@gmail.com?subject=Sentra%20suggestion" className="text-navy hover:underline">
            {t.footer.contact}
          </a>
        </nav>
        <p className="text-sm leading-relaxed text-muted">{t.footer.providerNote}</p>
      </div>
    </footer>
  );
}
