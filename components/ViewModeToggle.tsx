"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";

import { useViewMode } from "@/hooks/useViewMode";
import type { ViewMode } from "@/lib/types";

function isActiveClass(active: boolean, tone: "light" | "dark") {
  if (!active) {
    return tone === "light" ? "text-[var(--color-muted)]" : "text-white/80";
  }

  return tone === "light" ? "bg-[var(--color-accent)] text-white" : "bg-white text-[var(--color-accent)]";
}

export function ViewModeToggle({
  tone = "light",
  compact = false,
  className = "",
}: {
  tone?: "light" | "dark";
  compact?: boolean;
  className?: string;
}) {
  const t = useTranslations();
  const { resolvedMode, setMode } = useViewMode();

  const modes: Array<{ label: string; value: ViewMode; icon: typeof Monitor }> = [
    { label: t("websiteView"), value: "website", icon: Monitor },
    { label: t("appView"), value: "app", icon: Smartphone },
  ];

  return (
    <div
      className={`inline-flex rounded-full border p-1 ${
        tone === "light"
          ? "border-[var(--color-border)] bg-[var(--color-subtle)]"
          : "border-white/20 bg-transparent"
      } ${className}`}
      role="group"
      aria-label={t("viewMode")}
    >
      {modes.map((mode) => {
        const Icon = mode.icon;
        const active = resolvedMode === mode.value;

        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => setMode(mode.value)}
            aria-pressed={active}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
              compact ? "min-w-[92px] sm:min-w-[110px]" : "min-w-[120px] sm:min-w-[128px]"
            } ${isActiveClass(active, tone)}`}
          >
            <Icon className="size-4" />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
