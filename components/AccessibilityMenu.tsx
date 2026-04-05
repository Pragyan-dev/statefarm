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
  const isSpanish = settings.language === "es";

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-[rgb(7_10_22_/_0.76)] px-3 py-3 backdrop-blur-md sm:px-6 sm:py-6"
      onClick={onClose}
    >
      <section
        className="relative flex max-h-[min(92dvh,960px)] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-black/8 bg-[var(--color-paper)] shadow-[0_30px_90px_rgba(0,0,0,0.34)]"
        role="dialog"
        aria-modal="true"
        aria-label={t("accessibility")}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="relative border-b border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,252,251,0.96),rgba(251,246,239,0.98))] px-5 py-5 sm:px-6">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[var(--color-accent-wash)] blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                FirstCover
              </p>
              <h2 className="font-display text-2xl leading-tight text-[var(--color-ink)] sm:text-3xl">
                {t("accessibility")}
              </h2>
              <p className="mt-2 max-w-[42ch] text-sm text-[var(--color-muted)]">
                {isSpanish
                  ? "Ajusta lectura, contraste y movimiento sin pelear con el resto de la pagina."
                  : "Tune the reading and contrast system without fighting the rest of the page."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 min-w-11 rounded-full border border-[var(--color-border)] bg-white/70 text-[var(--color-ink)] shadow-sm"
              aria-label={isSpanish ? "Cerrar menu" : "Close menu"}
            >
              <X className="mx-auto size-4" />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-[1.6rem] border border-[var(--color-border)] bg-white/70 p-4 sm:p-5">
              <p className="mb-3 text-sm font-semibold text-[var(--color-ink)]">{t("language")}</p>
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
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      settings.language === language
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-paper)] shadow-[0_10px_24px_var(--color-accent-glow-strong)]"
                        : "border-[var(--color-border)] bg-white text-[var(--color-ink)]"
                    }`}
                  >
                    {language === "en" ? t("english") : t("spanish")}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-[var(--color-border)] bg-white/70 p-4 sm:p-5">
              <p className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
                {isSpanish ? "Tamano del texto" : "Text size"}
              </p>
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
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      settings.textSize === item.value
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-paper)] shadow-[0_10px_24px_var(--color-accent-glow-strong)]"
                        : "border-[var(--color-border)] bg-white text-[var(--color-ink)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-4 grid gap-3">
            {[
              {
                label: t("highContrast"),
                description: isSpanish
                  ? "Sube el contraste en tarjetas, botones y etiquetas."
                  : "Boost contrast across cards, buttons, and labels.",
                checked: settings.highContrast,
                onChange: (value: boolean) =>
                  setSettings((current) => ({ ...current, highContrast: value })),
              },
              {
                label: t("reducedMotion"),
                description: isSpanish
                  ? "Reduce casi toda la animacion y acelera las transiciones."
                  : "Remove most movement and speed up transitions.",
                checked: settings.reducedMotion,
                onChange: (value: boolean) =>
                  setSettings((current) => ({ ...current, reducedMotion: value })),
              },
              {
                label: t("voiceOutput"),
                description: isSpanish
                  ? "Lee automaticamente las secciones importantes."
                  : "Read important sections aloud automatically.",
                checked: settings.voiceOutput,
                onChange: (value: boolean) =>
                  setSettings((current) => ({ ...current, voiceOutput: value })),
              },
              {
                label: t("screenReaderMode"),
                description: isSpanish
                  ? "Aumenta el espaciado y simplifica las etiquetas visuales."
                  : "Increase spacing and simplify visual labels.",
                checked: settings.screenReaderOptimized,
                onChange: (value: boolean) =>
                  setSettings((current) => ({
                    ...current,
                    screenReaderOptimized: value,
                  })),
              },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                role="switch"
                aria-checked={item.checked}
                onClick={() => item.onChange(!item.checked)}
                className="flex min-h-16 items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white/70 px-4 py-4 text-left transition hover:bg-white/90"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[var(--color-ink)]">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-sm text-[var(--color-muted)]">
                    {item.description}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    item.checked ? "bg-[var(--color-accent)]" : "bg-[rgba(17,24,39,0.14)]"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      item.checked ? "left-6" : "left-1"
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <section className="rounded-[1.6rem] border border-[var(--color-border)] bg-white/70 p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3 text-sm font-semibold text-[var(--color-ink)]">
                <span>{isSpanish ? "Velocidad de voz" : "Voice speed"}</span>
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
                aria-label={isSpanish ? "Velocidad de voz" : "Voice speed"}
              />
            </section>

            <section className="rounded-[1.6rem] border border-[var(--color-border)] bg-white/70 p-4 sm:p-5">
              <p className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
                {isSpanish ? "Modo daltonismo" : "Color blind mode"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: isSpanish ? "Ninguno" : "None", value: "none" },
                  { label: isSpanish ? "Rojo-verde" : "Red-green", value: "deuteranopia" },
                  { label: isSpanish ? "Azul-amarillo" : "Blue-yellow", value: "tritanopia" },
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
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      settings.colorBlindMode === item.value
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-paper)] shadow-[0_10px_24px_var(--color-accent-glow-strong)]"
                        : "border-[var(--color-border)] bg-white text-[var(--color-ink)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(251,246,239,0.9),rgba(251,246,239,1))] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={resetSettings}
              className="min-h-12 flex-1 rounded-full border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)]"
            >
              {t("reset")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-12 flex-1 rounded-full bg-[var(--color-ink)] px-4 text-sm font-semibold text-[var(--color-paper)]"
            >
              {t("done")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
