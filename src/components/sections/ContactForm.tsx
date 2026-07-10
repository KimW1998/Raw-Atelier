import { useState } from "react";
import { AlertCircle, CheckCircle, Instagram, Mail } from "lucide-react";
import { useLocale, useTranslations } from "@/i18n/context";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/animations/FadeIn";
import { BRAND, CONTACT_FORM_NAME, CONTACT_SERVICE_IDS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function isLocalHost() {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

function encodeFormData(form: HTMLFormElement) {
  const formData = new FormData(form);
  const params = new URLSearchParams();

  for (const [key, value] of formData.entries()) {
    params.append(key, String(value));
  }

  return params.toString();
}

export function ContactForm() {
  const locale = useLocale();
  const t = useTranslations("contactPage");
  const tContactServices = useTranslations("contactServices");
  const tCta = useTranslations("cta");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const form = e.currentTarget;

    try {
      if (isLocalHost()) {
        const formData = new FormData(form);
        const name = String(formData.get("name") ?? "");
        const email = String(formData.get("email") ?? "");
        const company = String(formData.get("company") ?? "");
        const service = String(formData.get("service") ?? "");
        const message = String(formData.get("message") ?? "");
        const subject = encodeURIComponent(`Raw Atelier enquiry from ${name}`);
        const body = encodeURIComponent(
          [
            `Name: ${name}`,
            `Email: ${email}`,
            company ? `Company: ${company}` : null,
            service ? `Service: ${service}` : null,
            "",
            message,
          ]
            .filter(Boolean)
            .join("\n")
        );

        window.location.href = `mailto:${BRAND.email}?subject=${subject}&body=${body}`;
        setSubmitted(true);
        return;
      }

      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeFormData(form),
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      setSubmitted(true);
      form.reset();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <FadeIn className="flex flex-col items-center justify-center rounded-2xl bg-brand-pink-light p-12 text-center">
        <CheckCircle className="h-16 w-16 text-brand-pink-accent" />
        <h3 className="mt-6 font-heading text-2xl text-brand-black">
          {t("form.thankYouTitle")}
        </h3>
        <p className="mt-4 max-w-md font-body text-base leading-relaxed text-brand-black/70">
          {t("form.thankYouDescription")}
        </p>
        <div className="mt-8 flex gap-4">
          <Button href={BRAND.instagram} variant="primary" external>
            {t("form.followInstagram")}
          </Button>
          <Button href="/" variant="outline">
            {tCta("backToHome")}
          </Button>
        </div>
      </FadeIn>
    );
  }

  return (
    <form
      name={CONTACT_FORM_NAME}
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
    >
      <input type="hidden" name="form-name" value={CONTACT_FORM_NAME} />
      <input type="hidden" name="locale" value={locale} />
      <p className="hidden" aria-hidden="true">
        <label>
          Do not fill this out:
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      {error && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-left"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="font-body text-sm font-semibold text-red-800">
              {t("form.errorTitle")}
            </p>
            <p className="mt-1 font-body text-sm text-red-700">
              {t("form.errorDescription")}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block font-body text-sm font-semibold text-brand-black"
          >
            {t("form.name")}{" "}
            <span className="text-brand-pink-accent">{t("form.required")}</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full rounded-xl border border-brand-pink-light bg-white px-4 py-3 font-body text-sm text-brand-black transition-colors focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
            placeholder={t("form.namePlaceholder")}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block font-body text-sm font-semibold text-brand-black"
          >
            {t("form.email")}{" "}
            <span className="text-brand-pink-accent">{t("form.required")}</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full rounded-xl border border-brand-pink-light bg-white px-4 py-3 font-body text-sm text-brand-black transition-colors focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
            placeholder={t("form.emailPlaceholder")}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="company"
          className="mb-2 block font-body text-sm font-semibold text-brand-black"
        >
          {t("form.company")}
        </label>
        <input
          type="text"
          id="company"
          name="company"
          className="w-full rounded-xl border border-brand-pink-light bg-white px-4 py-3 font-body text-sm text-brand-black transition-colors focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
          placeholder={t("form.companyPlaceholder")}
        />
      </div>

      <div>
        <label
          htmlFor="service"
          className="mb-2 block font-body text-sm font-semibold text-brand-black"
        >
          {t("form.service")}
        </label>
        <select
          id="service"
          name="service"
          className="w-full rounded-xl border border-brand-pink-light bg-white px-4 py-3 font-body text-sm text-brand-black transition-colors focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
          defaultValue=""
        >
          <option value="" disabled>
            {t("form.servicePlaceholder")}
          </option>
          {CONTACT_SERVICE_IDS.map((id) => (
            <option key={id} value={id}>
              {tContactServices(id)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block font-body text-sm font-semibold text-brand-black"
        >
          {t("form.message")}{" "}
          <span className="text-brand-pink-accent">{t("form.required")}</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full resize-none rounded-xl border border-brand-pink-light bg-white px-4 py-3 font-body text-sm text-brand-black transition-colors focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
          placeholder={t("form.messagePlaceholder")}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="large"
        className={cn("w-full sm:w-auto", loading && "opacity-70")}
        disabled={loading}
      >
        {loading ? t("form.sending") : t("form.send")}
      </Button>
    </form>
  );
}

export function ContactInfo() {
  const t = useTranslations("contactPage");
  const tCta = useTranslations("cta");

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h3 className="font-heading text-2xl text-brand-black">
            {t("info.title")}
          </h3>
          <p className="mt-4 font-body text-base leading-relaxed text-brand-black/70">
            {t("info.description")}
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="space-y-4">
          <a
            href={`mailto:${BRAND.email}`}
            className="flex items-center gap-4 rounded-xl bg-brand-pink-light p-4 transition-colors hover:bg-brand-pink/30"
          >
            <Mail className="h-5 w-5 text-brand-pink-accent" />
            <div>
              <span className="block font-body text-xs font-semibold uppercase tracking-wider text-brand-black/50">
                {t("info.email")}
              </span>
              <span className="font-body text-sm text-brand-black">
                {BRAND.email}
              </span>
            </div>
          </a>
          <a
            href={BRAND.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl bg-brand-pink-light p-4 transition-colors hover:bg-brand-pink/30"
          >
            <Instagram className="h-5 w-5 text-brand-pink-accent" />
            <div>
              <span className="block font-body text-xs font-semibold uppercase tracking-wider text-brand-black/50">
                {t("info.instagram")}
              </span>
              <span className="font-body text-sm text-brand-black">
                @rawatelier
              </span>
            </div>
          </a>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="rounded-2xl bg-brand-black p-8 text-white">
          <h4 className="font-heading text-xl">{t("info.bookingTitle")}</h4>
          <p className="mt-3 font-body text-sm leading-relaxed text-white/70">
            {t("info.bookingDescription")}
          </p>
          <Button
            href="/contact"
            variant="secondary"
            className="mt-6"
          >
            {tCta("scheduleCall")}
          </Button>
        </div>
      </FadeIn>
    </div>
  );
}
