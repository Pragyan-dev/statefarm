"use client";

import { startTransition, useState } from "react";

import { ScenarioSelector } from "@/components/simulator/ScenarioSelector";
import { StorySimulator } from "@/components/simulator/StorySimulator";
import { getRelevantScenarios } from "@/data/scenarios/index";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { CompletionSummary } from "@/types/simulator";

const SIMULATOR_PROGRESS_KEY = "arrivesafe-simulator-progress";
const emptyProgress: Record<string, CompletionSummary> = {};

export default function SimulatePage() {
  const [profile, , isProfileReady] = useUserProfile();
  const [progress, setProgress, isProgressReady] = useLocalStorage<
    Record<string, CompletionSummary>
  >(SIMULATOR_PROGRESS_KEY, emptyProgress);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const scenarios = getRelevantScenarios(profile);
  const activeScenario = scenarios.find((scenario) => scenario.id === activeScenarioId) ?? null;

  function handleScenarioSelect(scenarioId: string | null) {
    startTransition(() => {
      setActiveScenarioId(scenarioId);
    });
  }

  function handleComplete(summary: CompletionSummary) {
    setProgress((current) => ({
      ...current,
      [summary.scenarioId]: summary,
    }));
  }

  if (!isProfileReady || !isProgressReady) {
    return (
      <div className="simulator-root grid place-items-center bg-[linear-gradient(180deg,#F6F0E7_0%,#EFE4D8_100%)] px-6">
        <div className="rounded-[1.75rem] border-[2px] border-black bg-white/85 px-5 py-4 text-center shadow-[0_18px_50px_rgba(17,24,39,0.1)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-black/45">
            ArriveSafe
          </p>
          <p className="mt-2 text-sm font-medium text-black/70">Loading simulator...</p>
        </div>
      </div>
    );
  }

  if (activeScenario) {
    return (
      <StorySimulator
        scenario={activeScenario}
        onComplete={handleComplete}
        onExit={() => handleScenarioSelect(null)}
      />
    );
  }

  return (
    <ScenarioSelector
      scenarios={scenarios}
      progress={progress}
      onSelect={(scenario) => handleScenarioSelect(scenario.id)}
    />
  );
}
