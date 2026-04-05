"use client";

import { useAccessibility } from "@/hooks/useAccessibility";

export function ClaimVideoSection() {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";

  return (
    <section className="panel-card">
      <p className="eyebrow">{isSpanish ? "Tutorial rapido" : "Quick tutorial"}</p>
      <h2 className="mt-2 font-display text-3xl leading-[0.98] text-[var(--color-ink)] sm:text-4xl">
        {isSpanish ? "📺 Mira: como presentar un reclamo" : "📺 Watch: how to file a claim"}
      </h2>
      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-paper)]">
        <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
          <iframe
            src="https://www.youtube.com/embed/QoVyaoIcJvQ"
            title="How to file an insurance claim"
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
        {isSpanish
          ? "Este video muestra el proceso de presentar un reclamo paso por paso."
          : "This video walks through the claim filing process step by step."}
      </p>
    </section>
  );
}
