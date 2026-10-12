import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_FORM_ENDPOINT, CONTACT_FORM_KEY, CONTACT_FORM_MODE } from "../config";
import { useLang } from "../i18n";
import { fadeUp } from "../motion/variants";
import { Section } from "./Section";

type Status = "idle" | "sending" | "sent" | "error";

const endpointConfigured =
  CONTACT_FORM_ENDPOINT.length > 0 && !CONTACT_FORM_ENDPOINT.includes("YOUR_");

/** Contact form: sends directly via Formspree/Web3Forms when configured,
 *  otherwise falls back to a prefilled mailto compose (no backend). */
export function Contact() {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    if (!endpointConfigured) {
      const subject = encodeURIComponent(`Sentra message from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      return;
    }
    setStatus("sending");
    try {
      const payload =
        CONTACT_FORM_MODE === "web3forms"
          ? { access_key: CONTACT_FORM_KEY, name, email, message, subject: `Sentra message from ${name}` }
          : { name, email, message };
      const res = await fetch(CONTACT_FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Section id="contact" eyebrow={t.contact.eyebrow} title={t.contact.title} muted>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mx-auto max-w-2xl rounded-3xl border border-line bg-white p-6 sm:p-8"
      >
        <p className="leading-relaxed text-muted">{t.contact.body}</p>
        {status === "sent" ? (
          <div role="status" className="mt-6 rounded-2xl border-2 border-sky bg-mist p-5 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-navy" aria-hidden="true" />
            <p className="font-display mt-2 font-bold text-navy">{t.contact.sentTitle}</p>
            <p className="mt-1 text-[15px] text-muted">{t.contact.sentBody}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">{t.contact.name}</span>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-h-[44px] w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink outline-none focus:border-sky"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">{t.contact.email}</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-[44px] w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink outline-none focus:border-sky"
                  dir="ltr"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">{t.contact.message}</span>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink outline-none focus:border-sky"
              />
            </label>
            {/* honeypot: invisible to humans, catches naive bots */}
            <input type="text" name="company" autoComplete="off" tabIndex={-1} aria-hidden="true" className="hidden" />
            {status === "error" && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {t.contact.errorBody}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="font-display inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-navy px-7 py-3 font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {status === "sending" ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-5 w-5" aria-hidden="true" />
              )}
              {status === "sending" ? t.contact.sending : t.contact.send}
            </button>
          </form>
        )}
      </motion.div>
    </Section>
  );
}
