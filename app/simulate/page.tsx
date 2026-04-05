"use client";

import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import scenarios from "@/data/scenarios.json";

import { ScenarioCard } from "@/components/ScenarioCard";
import { ScenarioSelector } from "@/components/simulator/ScenarioSelector";
import { StorySimulator } from "@/components/simulator/StorySimulator";
import { useAccessibility } from "@/hooks/useAccessibility";
import { getRelevantScenarios } from "@/data/scenarios/index";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useViewMode } from "@/hooks/useViewMode";
import { formatCurrency, getStateCosts } from "@/lib/content";
import type { ScenarioData } from "@/lib/types";
import type { CompletionSummary, StorySessionState } from "@/types/simulator";

const SIMULATOR_PROGRESS_KEY = "arrivesafe-simulator-progress";
const SIMULATOR_SESSION_KEY = "arrivesafe-simulator-session";
const emptyProgress: Record<string, CompletionSummary> = {};
const emptySession = null as StorySessionState | null;

export default function SimulatePage() {
  const router = useRouter();
  const t = useTranslations();
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const { resolvedMode } = useViewMode();
  const [profile, , isProfileReady] = useUserProfile();
  const [progress, setProgress, isProgressReady] = useLocalStorage<
    Record<string, CompletionSummary>
  >(SIMULATOR_PROGRESS_KEY, emptyProgress);
  const [storySession, setStorySession, isSessionReady] = useLocalStorage<StorySessionState | null>(
    SIMULATOR_SESSION_KEY,
    emptySession,
  );
  const [isStoryPickerOpen, setIsStoryPickerOpen] = useState(false);
  const activeScenarioId = storySession?.scenarioId ?? null;

  const storyScenarios = getRelevantScenarios(profile, settings.language);
  const activeScenario = storyScenarios.find((scenario) => scenario.id === activeScenarioId) ?? null;
  const chartScenarios = useMemo(
    () =>
      (scenarios as ScenarioData[]).filter((scenario) => {
        if (scenario.appliesIf === "always") {
          return true;
        }

        if (scenario.appliesIf === "drives") {
          return profile.drives;
        }

        return profile.rents;
      }),
    [profile.drives, profile.rents],
  );

  function handleScenarioSelect(scenarioId: string | null) {
    startTransition(() => {
      setIsStoryPickerOpen(false);
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
      <div className="simulator-root grid place-items-center bg-[linear-gradient(180deg,#F6F0E7_0%,#EFE4D8_100%)] px-6">
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

  if (resolvedMode === "website" && isStoryPickerOpen) {
    return (
      <ScenarioSelector
        scenarios={storyScenarios}
        progress={progress}
        onSelect={(scenario) => handleScenarioSelect(scenario.id)}
      />
    );
  }

  if (resolvedMode === "website") {
    const costs = getStateCosts(profile.state);
    const monthlyAnchor = profile.drives ? costs.autoLiability : costs.rentersMonthly;
    const anchorPercent = (((monthlyAnchor / (profile.monthlyIncome || 2800)) * 100) || 0).toFixed(1);
    const anchorCopy = isSpanish
      ? `Eso es ${anchorPercent}% de tu ingreso mensual. Pequeno comparado con una emergencia sin cobertura.`
      : `That is ${anchorPercent}% of your monthly income. Small compared with an uncovered emergency.`;

    return (
      <div className="py-6 lg:py-10">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="panel-card hero-ambient overflow-hidden">
            <p className="eyebrow">{`${t("websiteOverview")} · ${profile.city}, ${profile.state}`}</p>
            <h1 className="font-display text-4xl text-[var(--color-ink)] lg:max-w-[11ch]">
              {isSpanish
                ? "Mira primero la brecha de costo y luego cambia al modo historia cuando quieras la experiencia inmersiva."
                : "See the cost gap first, then switch into story mode when you want the immersive walkthrough."}
            </h1>
            <p className="mt-4 max-w-[42ch] text-base text-[var(--color-muted)]">
              {isSpanish
                ? "La vista web mantiene el simulador facil de escanear. La vista app convierte el mismo riesgo en una historia paso a paso con Safi y resultados ramificados."
                : "Website view keeps the simulator scannable. App view turns the same risk into a step-by-step story with Safi and branching outcomes."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsStoryPickerOpen(true)}
                className="min-h-12 rounded-full bg-[var(--color-ink)] px-5 text-sm font-semibold text-[var(--color-paper)]"
              >
                {t("openStoryMode")}
              </button>
            </div>
          </section>

          <section className="grid gap-6">
            <section className="panel-card">
              <p className="eyebrow">{isSpanish ? "Base de cobertura" : "Coverage anchor"}</p>
              <h2 className="font-display text-2xl text-[var(--color-ink)]">
                {isSpanish
                  ? `${formatCurrency(monthlyAnchor, settings.language)} / mes es la decision base que estas tomando.`
                  : `${formatCurrency(monthlyAnchor, settings.language)} / month is the baseline decision you are making.`}
              </h2>
              <p className="mt-4 text-sm text-[var(--color-muted)]">{anchorCopy}</p>
            </section>

            <section className="panel-card">
              <p className="eyebrow">{t("storyMode")}</p>
              <h2 className="font-display text-2xl text-[var(--color-ink)]">
                {isSpanish
                  ? "Usa la vista App cuando quieras la experiencia completa con ramas."
                  : "Use App view when you want the full branching experience."}
              </h2>
              <ul className="mt-4 grid gap-2 text-sm text-[var(--color-muted)]">
                <li>{isSpanish ? "Recorrido guiado por Safi" : "Character-driven walkthrough with Safi"}</li>
                <li>{isSpanish ? "Finales buenos y malos segun tus decisiones" : "Choice-based good and bad endings"}</li>
                <li>{isSpanish ? "Animacion de perdidas y ahorro" : "Animated loss and savings reveal"}</li>
              </ul>
            </section>
          </section>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">{isSpanish ? "Resumen de escenarios" : "Scenario overview"}</p>
              <h2 className="font-display text-3xl text-[var(--color-ink)]">
                {isSpanish
                  ? "Compara el dano antes de entrar a la historia."
                  : "Compare the damage before you step into the story."}
              </h2>
            </div>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            {chartScenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        </section>
      </div>
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
