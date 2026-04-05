"use client";

import { useTranslations } from "next-intl";

import { useAccessibility } from "@/hooks/useAccessibility";

export function LanguageToggle({
  tone = "dark",
  className = "",
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const t = useTranslations();
  const { settings, setSettings } = useAccessibility();

  return (
    <div
      className={`inline-flex rounded-full border p-1 ${
        tone === "light"
          ? "border-[var(--color-border)] bg-white/80"
          : "border-white/20 bg-white/10 backdrop-blur"
      } ${className}`}
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
            className={`min-h-11 rounded-full px-4 text-sm font-semibold transition ${
              active
                ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                : tone === "light"
                  ? "text-[var(--color-muted)]"
                  : "text-[var(--color-paper)]/75"
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
