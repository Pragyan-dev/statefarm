"use client";

import { CheckCircle2, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAccessibility } from "@/hooks/useAccessibility";
import { formatCurrency } from "@/lib/content";
import type { CompletionSummary, Scenario } from "@/types/simulator";

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  progress: Record<string, CompletionSummary>;
  onSelect: (scenario: Scenario) => void;
}

export function ScenarioSelector({
  scenarios,
  progress,
  onSelect,
}: ScenarioSelectorProps) {
  const t = useTranslations();
  const { settings } = useAccessibility();

  return (
    <div className="simulator-root bg-[linear-gradient(180deg,#F6F0E7_0%,#EFE4D8_100%)] px-4 py-6">
      <section className="rounded-[2rem] border-[2px] border-black bg-white/70 px-5 py-5 shadow-[0_22px_70px_rgba(17,24,39,0.1)] backdrop-blur">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-black/50">
          ArriveSafe
        </p>
        <h1 className="mt-3 font-display text-4xl leading-none text-black">
          {t("simulatorChooseTitle")}
        </h1>
        <p className="mt-4 max-w-[30ch] text-sm leading-6 text-black/70">
          {t("simulatorChooseDescription")}
        </p>
      </section>

      <div className="mt-5 grid gap-3">
        {scenarios.map((scenario) => {
          const completion = progress[scenario.id];
          const isGood = completion?.endingType === "good";
          const summary = completion
            ? `${t("simulatorCompleted")} — ${
                isGood ? t("simulatorYouSaved") : t("simulatorYouLost")
              } ${formatCurrency(isGood ? completion.savedAmount ?? 0 : completion.finalTotal, settings.language)}`
            : null;

          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelect(scenario)}
              className="flex min-h-20 w-full items-center gap-4 rounded-[1.4rem] border-[2px] border-black bg-white px-4 py-4 text-left shadow-[0_14px_36px_rgba(17,24,39,0.08)] transition active:scale-[0.98]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FFF1E2] text-2xl">
                {scenario.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-base font-bold text-black">{scenario.title}</span>
                  {completion ? <CheckCircle2 className="size-4 text-[var(--color-success)]" /> : null}
                </span>
                <span className="mt-1 block truncate text-sm text-black/65">{scenario.subtitle}</span>
                <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">
                  {scenario.estimatedTime}
                </span>
                {summary ? (
                  <span className="mt-2 block text-xs font-medium text-black/70">{summary}</span>
                ) : null}
              </span>
              <ChevronRight className="size-5 text-black/50" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
