"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

import { ScenarioSelector } from "@/components/simulator/ScenarioSelector";
import { StorySimulator } from "@/components/simulator/StorySimulator";
import { useAccessibility } from "@/hooks/useAccessibility";
import { getRelevantScenarios } from "@/data/scenarios/index";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { CompletionSummary, StorySessionState } from "@/types/simulator";

const SIMULATOR_PROGRESS_KEY = "arrivesafe-simulator-progress";
const SIMULATOR_SESSION_KEY = "arrivesafe-simulator-session";
const emptyProgress: Record<string, CompletionSummary> = {};
const emptySession = null as StorySessionState | null;

export default function SimulatePage() {
  const router = useRouter();
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const [profile, , isProfileReady] = useUserProfile();
  const [progress, setProgress, isProgressReady] = useLocalStorage<
    Record<string, CompletionSummary>
  >(SIMULATOR_PROGRESS_KEY, emptyProgress);
  const [storySession, setStorySession, isSessionReady] = useLocalStorage<StorySessionState | null>(
    SIMULATOR_SESSION_KEY,
    emptySession,
  );
  const activeScenarioId = storySession?.scenarioId ?? null;

  const storyScenarios = getRelevantScenarios(profile, settings.language);
  const activeScenario = storyScenarios.find((scenario) => scenario.id === activeScenarioId) ?? null;

  function handleScenarioSelect(scenarioId: string | null) {
    startTransition(() => {
      setStorySession(
        scenarioId
          ? {
              scenarioId,
              currentNodeId: "intro",
              history: [],
              completedTypingNodeId: null,
              completedEffectNodeId: null,
              lastEffect: null,
            }
          : null,
      );
    });
  }

  function handleComplete(summary: CompletionSummary) {
    setProgress((current) => ({
      ...current,
      [summary.scenarioId]: summary,
    }));
  }

  function handleExitSimulator() {
    setStorySession(null);
    router.push("/dashboard");
  }

  if (!isProfileReady || !isProgressReady || !isSessionReady) {
    return (
      <div className="simulator-root grid place-items-center bg-[#f2e7da] px-6">
        <div className="rounded-[1.75rem] border-[2px] border-black bg-white/85 px-5 py-4 text-center shadow-[0_18px_50px_rgba(17,24,39,0.1)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-black/45">
            FirstCover
          </p>
          <p className="mt-2 text-sm font-medium text-black/70">
            {isSpanish ? "Cargando simulador..." : "Loading simulator..."}
          </p>
        </div>
      </div>
    );
  }

  if (activeScenario) {
    return (
      <StorySimulator
        scenario={activeScenario}
        initialSession={storySession}
        onComplete={handleComplete}
        onSessionChange={setStorySession}
        onExit={handleExitSimulator}
      />
    );
  }

  return (
    <ScenarioSelector
      scenarios={storyScenarios}
      progress={progress}
      onSelect={(scenario) => handleScenarioSelect(scenario.id)}
    />
  );
}
