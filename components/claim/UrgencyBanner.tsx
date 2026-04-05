"use client";

import { AlertTriangle, Bolt, ClipboardList, Clock3 } from "lucide-react";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { ClaimGuide } from "@/types/claim";

const urgencyStyles: Record<
  ClaimGuide["urgencyLevel"],
  {
    className: string;
    icon: typeof Bolt;
    label: { en: string; es: string };
  }
> = {
  immediate: {
    className: "bg-[var(--color-danger)] text-white",
    icon: Bolt,
    label: {
      en: "Act now",
      es: "Actua ahora",
    },
  },
  within_24h: {
    className: "bg-amber-400 text-[#2f2208]",
    icon: Clock3,
    label: {
      en: "Within 24 hours",
      es: "Dentro de 24 horas",
    },
  },
  within_week: {
    className: "bg-sky-600 text-white",
    icon: ClipboardList,
    label: {
      en: "This week",
      es: "Esta semana",
    },
  },
};

export function UrgencyBanner({
  level,
  message,
}: {
  level: ClaimGuide["urgencyLevel"];
  message: string;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const style = urgencyStyles[level];
  const Icon = style.icon;

  return (
    <section className={`claim-urgency-breathe rounded-[1.5rem] p-4 shadow-[0_16px_36px_rgba(17,24,39,0.08)] ${style.className}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15">
          <Icon className="size-5" />
        </span>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.22em]">
              {isSpanish ? style.label.es : style.label.en}
            </span>
            {level === "immediate" ? <AlertTriangle className="size-4" /> : null}
          </div>
          <p className="text-sm leading-relaxed sm:text-base">{message}</p>
        </div>
      </div>
    </section>
  );
}
