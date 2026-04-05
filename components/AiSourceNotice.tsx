"use client";

import { useAccessibility } from "@/hooks/useAccessibility";

export function AiSourceNotice({
  aiSource,
  fallbackReason,
}: {
  aiSource?: "openrouter" | "local";
  fallbackReason?: string;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";

  if (!aiSource) {
    return null;
  }

  if (aiSource === "openrouter") {
    return (
      <div className="rounded-full border border-[rgba(31,122,90,0.22)] bg-[rgba(31,122,90,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--color-success)]">
        {isSpanish ? "OpenRouter en vivo" : "OpenRouter live"}
      </div>
    );
  }

  return (
    <div className="rounded-[1.25rem] border border-[rgba(213,136,27,0.24)] bg-[rgba(213,136,27,0.09)] px-4 py-3 text-sm text-[var(--color-ink)]">
      <p className="font-semibold">
        {isSpanish ? "Usando respuesta local" : "Using local fallback"}
      </p>
      <p className="mt-1 text-[var(--color-muted)]">
        {isSpanish
          ? "Esta respuesta no vino de OpenRouter."
          : "This result did not come from OpenRouter."}
        {fallbackReason ? ` ${fallbackReason}` : ""}
      </p>
    </div>
  );
}
