"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

import { useAccessibility } from "@/hooks/useAccessibility";

export function AccessibilityMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations();
  const { settings, setSettings, resetSettings } = useAccessibility();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgb(7_10_22_/_0.68)] backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        className="absolute inset-x-3 bottom-20 rounded-[2rem] border border-white/15 bg-[var(--color-surface)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
        role="dialog"
        aria-modal="true"
        aria-label={t("accessibility")}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
              ArriveSafe
            </p>
            <h2 className="font-display text-2xl text-[var(--color-ink)]">
              {t("accessibility")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 rounded-full border border-[var(--color-border)] text-[var(--color-ink)]"
            aria-label="Close menu"
          >
            <X className="mx-auto size-4" />
          </button>
        </header>

        <div className="space-y-4 text-[var(--color-ink)]">
          <div>
            <p className="mb-2 text-sm font-semibold">{t("language")}</p>
            <div className="grid grid-cols-2 gap-2">
              {(["en", "es"] as const).map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      language,
                    }))
                  }
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    settings.language === language
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-paper)]"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  {language === "en" ? t("english") : t("spanish")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Text size</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "A", value: "normal" },
                { label: "A+", value: "large" },
                { label: "A++", value: "xl" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      textSize: item.value as "normal" | "large" | "xl",
                    }))
                  }
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    settings.textSize === item.value
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-paper)]"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {[
            {
              label: t("highContrast"),
              checked: settings.highContrast,
              onChange: (value: boolean) =>
                setSettings((current) => ({ ...current, highContrast: value })),
            },
            {
              label: t("reducedMotion"),
              checked: settings.reducedMotion,
              onChange: (value: boolean) =>
                setSettings((current) => ({ ...current, reducedMotion: value })),
            },
            {
              label: t("voiceOutput"),
              checked: settings.voiceOutput,
              onChange: (value: boolean) =>
                setSettings((current) => ({ ...current, voiceOutput: value })),
            },
            {
              label: t("screenReaderMode"),
              checked: settings.screenReaderOptimized,
              onChange: (value: boolean) =>
                setSettings((current) => ({
                  ...current,
                  screenReaderOptimized: value,
                })),
            },
          ].map((item) => (
            <label
              key={item.label}
              className="flex min-h-12 items-center justify-between rounded-2xl border border-[var(--color-border)] px-4 py-3"
            >
              <span className="text-sm font-semibold">{item.label}</span>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(event) => item.onChange(event.target.checked)}
                className="h-5 w-5 accent-[var(--color-accent)]"
              />
            </label>
          ))}

          <div>
            <div className="mb-2 flex items-center justify-between text-sm font-semibold">
              <span>Voice speed</span>
              <span>{settings.voiceSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.2"
              step="0.1"
              value={settings.voiceSpeed}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  voiceSpeed: Number(event.target.value),
                }))
              }
              className="w-full accent-[var(--color-accent)]"
              aria-label="Voice speed"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Color blind mode</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "None", value: "none" },
                { label: "Red-green", value: "deuteranopia" },
                { label: "Blue-yellow", value: "tritanopia" },
                { label: "Protanopia", value: "protanopia" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      colorBlindMode: item.value as
                        | "none"
                        | "deuteranopia"
                        | "tritanopia"
                        | "protanopia",
                    }))
                  }
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    settings.colorBlindMode === item.value
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-paper)]"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={resetSettings}
            className="min-h-11 flex-1 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-ink)]"
          >
            {t("reset")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 flex-1 rounded-full bg-[var(--color-ink)] px-4 text-sm font-semibold text-[var(--color-paper)]"
          >
            {t("done")}
          </button>
        </div>
      </section>
    </div>
  );
}
