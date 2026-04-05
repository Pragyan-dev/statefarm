"use client";

import { useMemo, useState } from "react";

import { ReadAloud } from "@/components/ReadAloud";
import { useAccessibility } from "@/hooks/useAccessibility";
import { pickText } from "@/lib/content";
import type { LocalizedText, VisaGuideStep } from "@/lib/types";

export interface VisaGuideData {
  visa: string;
  title: LocalizedText;
  steps: VisaGuideStep[];
  addon?: {
    title: LocalizedText;
    items: LocalizedText[];
  };
}

export function VisaGuide({
  guides,
  activeVisa,
}: {
  guides: VisaGuideData[];
  activeVisa: string;
}) {
  const { settings } = useAccessibility();
  const [selectedVisa, setSelectedVisa] = useState(activeVisa);
  const [expanded, setExpanded] = useState(0);

  const activeGuide = useMemo(
    () => guides.find((guide) => guide.visa === selectedVisa) ?? guides[0],
    [guides, selectedVisa],
  );
  const isSpanish = settings.language === "es";

  return (
    <section className="panel-card">
      <p className="eyebrow">{isSpanish ? "Primeros 30 dias" : "First 30 days"}</p>
      <h2 className="font-display text-2xl text-[var(--color-ink)]">
        {pickText(activeGuide.title, settings.language)}
      </h2>

      <div role="tablist" aria-label={isSpanish ? "Guias de visa" : "Visa guides"} className="mt-5 grid grid-cols-4 gap-2">
        {guides.map((guide) => {
          const active = guide.visa === selectedVisa;
          return (
            <button
              key={guide.visa}
              role="tab"
              aria-selected={active}
              aria-controls={`${guide.visa}-panel`}
              id={`${guide.visa}-tab`}
              type="button"
              onClick={() => {
                setSelectedVisa(guide.visa);
                setExpanded(0);
              }}
              className={`rounded-full px-3 py-3 text-sm font-semibold ${
                active
                  ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                  : "border border-[var(--color-border)] text-[var(--color-ink)]"
              }`}
            >
              {guide.visa}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${activeGuide.visa}-panel`}
        aria-labelledby={`${activeGuide.visa}-tab`}
        className="mt-5"
      >
        <div className="mb-4 flex gap-2">
          {activeGuide.steps.map((step) => (
            <span
              key={`${activeGuide.visa}-${step.week}-${step.docs.join("-")}`}
              className={`h-2 flex-1 rounded-full ${
                step.week - 1 <= expanded ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
              }`}
            />
          ))}
        </div>

        <div className="grid gap-3">
          {activeGuide.steps.map((step, index) => {
            const isExpanded = index === expanded;
            const narration = `${pickText(step.step, settings.language)} ${pickText(
              step.details,
              settings.language,
            )}`;

            return (
              <article
                key={`${activeGuide.visa}-${index}`}
                className="rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(index)}
                  className="flex w-full items-start justify-between gap-3 text-left"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
                      {isSpanish ? "Semana" : "Week"} {step.week}
                    </p>
                    <h3 className="mt-1 font-semibold text-[var(--color-ink)]">
                      {pickText(step.step, settings.language)}
                    </h3>
                  </div>
                  <span className="rounded-full bg-[var(--color-highlight)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                    {isExpanded ? "-" : "+"}
                  </span>
                </button>

                {isExpanded ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-[var(--color-muted)]">
                      {pickText(step.details, settings.language)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.docs.map((doc) => (
                        <span
                          key={doc}
                          className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-muted)]"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                    {step.link ? (
                      <a
                        href={step.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-sm font-semibold text-[var(--color-accent)]"
                      >
                        {isSpanish ? "Abrir recurso" : "Open resource"}
                      </a>
                    ) : null}
                    <ReadAloud text={narration} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        {activeGuide.addon ? (
          <div className="mt-5 rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4">
            <h3 className="font-semibold text-[var(--color-ink)]">
              {pickText(activeGuide.addon.title, settings.language)}
            </h3>
            <ul className="mt-3 grid gap-2 text-sm text-[var(--color-muted)]">
              {activeGuide.addon.items.map((item) => (
                <li key={item.en}>{pickText(item, settings.language)}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
