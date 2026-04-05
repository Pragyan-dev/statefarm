"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";

import { ReadAloud } from "@/components/ReadAloud";
import { useAccessibility } from "@/hooks/useAccessibility";
import { buildGoogleMapsSearchUrl, pickText } from "@/lib/content";
import type { LocalizedText, NewcomerGuideStep } from "@/lib/types";

export interface NewcomerGuideData {
  visa: string;
  title: LocalizedText;
  steps: NewcomerGuideStep[];
  addon?: {
    title: LocalizedText;
    items: LocalizedText[];
  };
}

export function NewcomerGuide({
  guides,
  activeVisa,
  zipCode,
  completedTaskIds = [],
  onToggleTask = () => {},
}: {
  guides: NewcomerGuideData[];
  activeVisa: string;
  zipCode: string;
  completedTaskIds?: string[];
  onToggleTask?: (taskId: string) => void;
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
      <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
        {pickText(activeGuide.title, settings.language)}
      </h2>

      {guides.length > 1 ? (
        <div
          role="tablist"
          aria-label={isSpanish ? "Guias de visa" : "Visa guides"}
          className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
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
                className={`rounded-full border px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] bg-white text-[var(--color-ink)]"
                }`}
              >
                {guide.visa}
              </button>
            );
          })}
        </div>
      ) : null}

      <div
        role="tabpanel"
        id={`${activeGuide.visa}-panel`}
        aria-labelledby={`${activeGuide.visa}-tab`}
        className="mt-5"
      >
        <div className="grid gap-3">
          {activeGuide.steps.map((step, index) => {
            const isExpanded = index === expanded;
            const narration = `${pickText(step.step, settings.language)} ${pickText(
              step.details,
              settings.language,
            )}`;
            const mapsUrl = step.mapsQuery
              ? buildGoogleMapsSearchUrl(step.mapsQuery, zipCode)
              : null;
            const resourceLinks = step.resources ?? (
              step.link
                ? [{
                    label: {
                      en: "Online portal",
                      es: "Portal en linea",
                    },
                    href: step.link,
                  }]
                : []
            );
            const taskId = `newcomer-${activeGuide.visa}-${index}`;
            const isDone = completedTaskIds.includes(taskId);

            return (
              <article
                key={`${activeGuide.visa}-${index}`}
                className={`rounded-[1.5rem] border px-4 py-4 transition ${
                  isExpanded
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                    : isDone
                      ? "border-[rgba(31,122,90,0.28)] bg-[rgba(31,122,90,0.06)]"
                      : "border-[var(--color-border)] bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
                      <span>TO DO{index + 1}</span>
                      {step.timing ? (
                        <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-[10px] tracking-[0.18em] text-[var(--color-accent)]">
                          {pickText(step.timing, settings.language)}
                        </span>
                      ) : null}
                    </p>
                    <h3 className="mt-1 font-semibold text-[var(--color-ink)]">
                      {pickText(step.step, settings.language)}
                    </h3>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleTask(taskId)}
                      aria-pressed={isDone}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                        isDone
                          ? "border-[var(--color-success)] bg-[var(--color-success)] text-white"
                          : "border-[var(--color-border)] bg-white/80 text-[var(--color-ink)] hover:border-[var(--color-success)] hover:text-[var(--color-success)]"
                      }`}
                    >
                      <Check className="size-3.5" />
                      <span>{isSpanish ? (isDone ? "Hecho" : "Marcar hecho") : (isDone ? "Done" : "Mark done")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? -1 : index)}
                      aria-expanded={isExpanded}
                      aria-controls={`${activeGuide.visa}-task-${index}`}
                      className="rounded-full bg-[var(--color-highlight)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]"
                    >
                      {isExpanded ? "-" : "+"}
                    </button>
                  </div>
                </div>

                {isExpanded ? (
                  <div id={`${activeGuide.visa}-task-${index}`} className="mt-4 space-y-3">
                    <p className="text-sm text-[var(--color-muted)]">
                      {pickText(step.details, settings.language)}
                    </p>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                        {isSpanish ? "Lleva contigo" : "Bring with you"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {step.docs.map((doc) => (
                          <span
                            key={doc}
                            className="rounded-full border border-[var(--color-border)] bg-[var(--color-subtle)] px-3 py-2 text-xs font-semibold text-[var(--color-muted)]"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                    {mapsUrl ? (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="button-secondary px-4 py-2 text-sm font-semibold"
                      >
                        {isSpanish ? "Buscar ubicacion cercana" : "Find nearest location"}
                      </a>
                    ) : null}
                    {resourceLinks.length ? (
                      <div className="flex flex-wrap gap-2">
                        {resourceLinks.map((resource) => (
                          <a
                            key={`${resource.href}-${resource.label.en}`}
                            href={resource.href}
                            target="_blank"
                            rel="noreferrer"
                            className="button-secondary px-4 py-2 text-sm font-semibold text-[var(--color-accent)]"
                          >
                            {pickText(resource.label, settings.language)}
                          </a>
                        ))}
                      </div>
                    ) : null}
                    <ReadAloud text={narration} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        {activeGuide.addon ? (
          <div className="sf-side-panel mt-5 px-4 py-4">
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
