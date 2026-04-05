"use client";

import { useEffect, useMemo, useState } from "react";

import { useAccessibility } from "@/hooks/useAccessibility";
import { formatCurrency } from "@/lib/content";
import type { FinancialEffect } from "@/types/simulator";

export interface EffectRevealProps {
  effect: FinancialEffect;
  onComplete?: () => void;
}

export function EffectRevealBase({ effect, onComplete }: EffectRevealProps) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const instantReveal = settings.reducedMotion;
  const [visibleItems, setVisibleItems] = useState(() => (instantReveal ? effect.items.length : 0));
  const [showLine, setShowLine] = useState(() => instantReveal);
  const [showTotal, setShowTotal] = useState(() => instantReveal);

  const tone =
    effect.type === "damage"
      ? {
          amountClass: "text-[var(--color-danger)]",
          totalClass: "text-[var(--color-danger)] sim-total-damage",
          neutralPill: "border-[var(--color-danger)]/25 bg-[rgba(182,70,59,0.08)] text-[var(--color-danger)]",
        }
      : {
          amountClass: "text-[var(--color-success)]",
          totalClass: "text-[var(--color-success)] sim-total-saved",
          neutralPill: "border-[var(--color-success)]/25 bg-[rgba(31,122,90,0.08)] text-[var(--color-success)]",
        };

  useEffect(() => {
    if (instantReveal) {
      onComplete?.();
      return;
    }

    const timeouts: number[] = [];

    effect.items.forEach((_, index) => {
      const timeout = window.setTimeout(() => {
        setVisibleItems(index + 1);
      }, 600 * index + 100);

      timeouts.push(timeout);
    });

    const lineTimeout = window.setTimeout(() => {
      setShowLine(true);
    }, effect.items.length * 600 + 250);
    const totalTimeout = window.setTimeout(() => {
      setShowTotal(true);
      onComplete?.();
    }, effect.items.length * 600 + 800);

    timeouts.push(lineTimeout, totalTimeout);

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [effect.items, instantReveal, onComplete]);

  const totalLabel = useMemo(() => formatCurrency(effect.total, settings.language), [effect.total, settings.language]);

  return (
    <section className="rounded-[1.15rem] border border-black/10 bg-[#FFFDF8] px-3 py-3">
      <div className="grid gap-2">
        {effect.items.slice(0, visibleItems).map((item) => (
          <div
            key={`${item.label}-${item.amount}`}
            className="sim-slide-in-right flex items-center justify-between gap-3 rounded-[0.95rem] bg-stone-50 px-3 py-3"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-base">{item.icon ?? (item.amount === 0 ? "•" : "💸")}</span>
              <span className="text-sm font-medium text-black/80">{item.label}</span>
            </div>
            {item.amount > 0 ? (
              <span className={`text-sm font-extrabold ${tone.amountClass}`}>
                {formatCurrency(item.amount, settings.language)}
              </span>
            ) : (
              <span
                className={`rounded-full border px-2 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${tone.neutralPill}`}
              >
                {effect.type === "damage"
                  ? isSpanish
                    ? "impacto"
                    : "impact"
                  : isSpanish
                    ? "incluido"
                    : "included"}
              </span>
            )}
          </div>
        ))}
      </div>

      {showLine ? <div className="sim-draw-line mt-4 h-[2px] bg-black/80" /> : null}

      {showTotal ? (
        <div className="mt-4 text-right">
          <p className={`text-4xl font-black ${tone.totalClass}`}>{totalLabel}</p>
          {effect.monthlyEquivalent ? (
            <p className="mt-2 text-sm italic text-black/55">{effect.monthlyEquivalent}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function DamageReveal({ effect, onComplete }: EffectRevealProps) {
  return <EffectRevealBase effect={effect} onComplete={onComplete} />;
}
