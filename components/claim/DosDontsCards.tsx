"use client";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { DoDontItem } from "@/types/claim";

export function DosDontsCards({
  dos,
  donts,
}: {
  dos: DoDontItem[];
  donts: DoDontItem[];
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";

  return (
    <section className="panel-card">
      <div className="max-w-[36rem]">
        <p className="eyebrow">{isSpanish ? "Errores comunes" : "Common mistakes"}</p>
        <h2 className="mt-2 font-display text-3xl leading-[0.98] text-[var(--color-ink)] sm:text-4xl">
          {isSpanish
            ? "Lo que te ayuda vs. lo que puede danar tu reclamo."
            : "What helps you vs. what can hurt your claim."}
        </h2>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <span className="inline-flex rounded-full bg-[rgba(31,122,90,0.14)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-success)]">
            ✅ {isSpanish ? "Haz esto" : "Do this"}
          </span>
          {dos.map((item, index) => (
            <article
              key={`${item.text}-${index}`}
              className="claim-slide-in-left rounded-[1.3rem] border border-[rgba(31,122,90,0.16)] bg-[rgba(31,122,90,0.06)] p-4"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex gap-3">
                <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                  {item.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{item.text}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
                    {item.explanation}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-3">
          <span className="inline-flex rounded-full bg-[rgba(182,70,59,0.12)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-danger)]">
            ❌ {isSpanish ? "No hagas esto" : "Don't do this"}
          </span>
          {donts.map((item, index) => (
            <article
              key={`${item.text}-${index}`}
              className={`claim-slide-in-right rounded-[1.3rem] border border-[rgba(182,70,59,0.16)] bg-[rgba(182,70,59,0.06)] p-4 ${
                index === 0 ? "ring-1 ring-[rgba(182,70,59,0.22)] shadow-[0_16px_30px_rgba(182,70,59,0.08)]" : ""
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex gap-3">
                <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                  {item.icon}
                </span>
                <div>
                  {index === 0 ? (
                    <span className="mb-2 inline-flex rounded-full bg-[rgba(182,70,59,0.12)] px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[var(--color-danger)]">
                      {isSpanish ? "Mas importante" : "Most important"}
                    </span>
                  ) : null}
                  <p className={`text-sm font-semibold text-[var(--color-ink)] ${index === 0 ? "" : "line-through decoration-[rgba(182,70,59,0.5)] decoration-2"}`}>
                    {item.text}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
                    {item.explanation}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
