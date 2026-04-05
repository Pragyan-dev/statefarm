"use client";

import { useEffect, useState } from "react";

import { useAccessibility } from "@/hooks/useAccessibility";

interface PolicyHealthGaugeProps {
  score: number;
  animated?: boolean;
  layout?: "app" | "website";
}

export function PolicyHealthGauge({
  score,
  animated = true,
  layout = "app",
}: PolicyHealthGaugeProps) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const reducedMotion = settings.reducedMotion;
  const safeScore = Math.max(0, Math.min(score, 100));
  const gaugeSize = layout === "website" ? 208 : 180;
  const center = gaugeSize / 2;
  const radius = layout === "website" ? 90 : 78;
  const circumference = 2 * Math.PI * radius;
  const animatedScore = useCountUp(safeScore, reducedMotion || !animated);
  const displayScore = reducedMotion || !animated ? safeScore : animatedScore;
  const strokeOffset = circumference - (displayScore / 100) * circumference;

  const tone =
    safeScore < 40
      ? {
          color: "#E24B4A",
          label: isSpanish ? "Cobertura pobre — faltan protecciones clave" : "Poor coverage — significant gaps",
        }
      : safeScore < 70
        ? {
            color: "#EF9F27",
            label: isSpanish ? "Cobertura regular — hay brechas por cerrar" : "Fair coverage — some gaps to address",
          }
        : {
            color: "#639922",
            label: isSpanish ? "Buena cobertura — estas bastante protegido" : "Good coverage — well protected",
          };
  const containerClass =
    layout === "website"
      ? "panel-card flex min-h-[24rem] w-full flex-col items-center justify-center px-6 py-8 text-center xl:min-h-[26rem]"
      : "panel-card mx-auto flex w-full max-w-[32rem] flex-col items-center text-center";

  return (
    <section className={containerClass}>
      <p className="eyebrow">{isSpanish ? "Salud de la poliza" : "Policy health"}</p>
      <div className="relative mt-4">
        <svg width={gaugeSize} height={gaugeSize} viewBox={`0 0 ${gaugeSize} ${gaugeSize}`} aria-hidden="true">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E5E5E5"
            strokeWidth="12"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={tone.color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            transform={`rotate(-90 ${center} ${center})`}
            style={{
              transition: reducedMotion ? "none" : "stroke-dashoffset 1.5s ease-out",
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className={`font-display leading-none text-[var(--color-ink)] ${
              layout === "website" ? "text-6xl" : "text-5xl"
            }`}
          >
            {displayScore}
          </div>
          <div className="mt-1 text-sm font-semibold tracking-[0.18em] text-[var(--color-muted)]">
            / 100
          </div>
        </div>
      </div>

      <p
        className={`mt-4 text-base font-semibold ${layout === "website" ? "max-w-[28ch]" : "max-w-[24ch]"}`}
        style={{ color: tone.color }}
      >
        {tone.label}
      </p>
    </section>
  );
}

function useCountUp(target: number, disabled: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const start = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / 1500, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress >= 1) {
        window.clearInterval(timer);
      }
    }, 16);

    return () => {
      window.clearInterval(timer);
    };
  }, [disabled, target]);

  return count;
}
