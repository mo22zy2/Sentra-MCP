import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ar } from "./ar";
import { en, type Dict } from "./en";

export type Lang = "en" | "ar";

const dicts: Record<Lang, Dict> = { en, ar };
const STORAGE_KEY = "sentra-lang";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "ar" ? "ar" : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* private mode — ignore */
    }
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang, t: dicts[lang] }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
