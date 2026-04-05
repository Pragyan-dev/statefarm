"use client";

import { useTranslations } from "next-intl";

import { useAccessibility } from "@/hooks/useAccessibility";

export function LanguageToggle({
  tone = "dark",
}: {
  tone?: "dark" | "light";
}) {
  const t = useTranslations();
  const { settings, setSettings } = useAccessibility();

  return (
    <div
      className={`inline-flex rounded-full border p-1 ${
        tone === "light"
          ? "border-[var(--color-border)] bg-[var(--color-subtle)]"
          : "border-white/20 bg-transparent"
      }`}
      role="group"
      aria-label={t("language")}
    >
      {(["en", "es"] as const).map((language) => {
        const active = settings.language === language;
        return (
          <button
            key={language}
            type="button"
            onClick={() =>
              setSettings((current) => ({
                ...current,
                language,
              }))
            }
            className={`min-h-10 rounded-full px-3 text-sm font-semibold transition sm:px-4 ${
              active
                ? tone === "light"
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-white text-[var(--color-accent)]"
                : tone === "light"
                  ? "text-[var(--color-muted)]"
                  : "text-white/80"
            }`}
            aria-pressed={active}
          >
            {language === "en" ? t("english") : t("spanish")}
          </button>
        );
      })}
    </div>
  );
}
