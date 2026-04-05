"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";

import { useViewMode } from "@/hooks/useViewMode";
import type { ViewMode } from "@/lib/types";

function isActiveClass(active: boolean, tone: "light" | "dark") {
  if (tone === "light") {
    return active
      ? "bg-white text-[var(--color-accent)] shadow-[0_10px_24px_rgba(131,36,21,0.18)]"
      : "text-white/78 hover:text-white";
  }

  return active ? "bg-white text-[var(--color-ink)] shadow-sm" : "text-white/70";
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
          ? "border-white/20 bg-transparent text-white"
          : "border-white/15 bg-black/35 backdrop-blur"
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
              compact ? "min-w-[96px]" : "min-w-[128px]"
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
