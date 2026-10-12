import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Star, X } from "lucide-react";
import { GITHUB_URL } from "../config";
import { useLang } from "../i18n";
import { Logo } from "./Section";

const LINKS = [
  { href: "#what", key: "what" },
  { href: "#features", key: "features" },
  { href: "#how", key: "how" },
  { href: "#agents", key: "agents" },
  { href: "#demo", key: "demo" },
  { href: "#quickstart", key: "quick" },
  { href: "#install", key: "install" },
  { href: "#faq", key: "faq" },
] as const;

export function GithubCta({ variant = "nav" }: { variant?: "nav" | "hero" | "cta" | "drawer" }) {
  const { t } = useLang();
  const ready = GITHUB_URL.length > 0;
  const cls =
    variant === "nav"
      ? "hidden items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-deep sm:inline-flex"
      : variant === "drawer"
        ? "inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
        : variant === "hero"
        ? "inline-flex items-center gap-2 rounded-xl border-2 border-navy bg-white px-6 py-3.5 font-semibold text-navy transition-colors hover:bg-mist"
        : "inline-flex items-center gap-2 rounded-xl border-2 border-navy bg-white px-6 py-3.5 font-semibold text-navy transition-colors hover:bg-mist";

  if (!ready) {
    return (
      <span className={`${cls} cursor-not-allowed opacity-60`} title={t.nav.githubSoon} aria-disabled="true">
        <Star className="h-4 w-4" />
        {t.nav.github}
      </span>
    );
  }
  return (
    <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={cls}>
      <Star className="h-4 w-4" />
      {t.nav.github}
    </a>
  );
}

export function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center rounded-xl border border-line p-1 text-sm font-semibold" role="group" aria-label="Language / اللغة">
      {(["en", "ar"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`min-h-[44px] min-w-[44px] rounded-lg px-3.5 py-2 transition-colors ${
            lang === l ? "bg-navy text-white" : "text-muted hover:text-navy"
          }`}
        >
          {l === "en" ? "EN" : "عربي"}
        </button>
      ))}
    </div>
  );
}

export function Navbar() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled ? "border-b border-line bg-white/90 backdrop-blur-md" : "bg-white"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8" aria-label="Main">
        <Logo />
        <div className="hidden items-center gap-7 text-[15px] font-medium text-ink md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-navy">
              {t.nav[l.key]}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <LangSwitch />
          <GithubCta variant="nav" />
        </div>
        <button
          className="min-h-[44px] min-w-[44px] rounded-lg p-2.5 text-navy md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t.nav.close : t.nav.menu}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-line bg-white md:hidden"
          >
            <div className="flex flex-col gap-4 px-5 py-5">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="min-h-[44px] content-center text-base font-medium text-ink">
                  {t.nav[l.key]}
                </a>
              ))}
              <div className="flex flex-wrap items-center gap-3">
                <LangSwitch />
                <GithubCta variant="drawer" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
