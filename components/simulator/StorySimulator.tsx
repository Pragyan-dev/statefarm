"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { ChoiceButtons } from "@/components/simulator/ChoiceButtons";
import { DamageReveal } from "@/components/simulator/DamageReveal";
import { DialogueBox } from "@/components/simulator/DialogueBox";
import { SafiCharacter } from "@/components/simulator/SafiCharacter";
import { SavingsReveal } from "@/components/simulator/SavingsReveal";
import { SimulatorResult } from "@/components/simulator/SimulatorResult";
import { useAccessibility } from "@/hooks/useAccessibility";
import type {
  CompletionSummary,
  DialogueNode,
  FinancialEffect,
  Scenario,
  StorySessionState,
} from "@/types/simulator";

interface StorySimulatorProps {
  scenario: Scenario;
  initialSession: StorySessionState | null;
  onComplete: (result: CompletionSummary) => void;
  onSessionChange: (session: StorySessionState | null) => void;
  onExit: () => void;
}

export function StorySimulator({
  scenario,
  initialSession,
  onComplete,
  onSessionChange,
  onExit,
}: StorySimulatorProps) {
  const t = useTranslations();
  const { settings } = useAccessibility();
  const nodeMap = useMemo(
    () => new Map(scenario.nodes.map((node) => [node.id, node])),
    [scenario.nodes],
  );
  const badTotal = useMemo(
    () =>
      scenario.nodes
        .filter((node) => node.effect?.type === "damage")
        .reduce((max, node) => Math.max(max, node.effect?.total ?? 0), 0),
    [scenario.nodes],
  );

  const [currentNodeId, setCurrentNodeId] = useState(initialSession?.currentNodeId ?? "intro");
  const [history, setHistory] = useState<string[]>(initialSession?.history ?? []);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [completedTypingNodeId, setCompletedTypingNodeId] = useState<string | null>(
    initialSession?.completedTypingNodeId ?? null,
  );
  const [completedEffectNodeId, setCompletedEffectNodeId] = useState<string | null>(
    initialSession?.completedEffectNodeId ?? null,
  );
  const [lastEffect, setLastEffect] = useState<FinancialEffect | null>(initialSession?.lastEffect ?? null);
  const completionRef = useRef<string | null>(null);

  const currentNode = nodeMap.get(currentNodeId) as DialogueNode;
  const emotion = currentNode.emotion ?? "neutral";
  const hasChoices = Boolean(currentNode.choices?.length);
  const isTextDone = completedTypingNodeId === currentNodeId;
  const isEffectComplete = !currentNode.effect || completedEffectNodeId === currentNodeId;
  const canInteract = isTextDone && isEffectComplete && !isTransitioning;

  const transitionTo = useCallback(
    (nextNodeId: string) => {
      if (isTransitioning || !nodeMap.has(nextNodeId)) {
        return;
      }

      setIsTransitioning(true);

      window.setTimeout(() => {
        setCompletedTypingNodeId(null);
        setCompletedEffectNodeId(null);
        setHistory((currentHistory) => [...currentHistory, currentNodeId]);
        setCurrentNodeId(nextNodeId);
      }, settings.reducedMotion ? 20 : 180);

      window.setTimeout(() => {
        setIsTransitioning(false);
      }, settings.reducedMotion ? 30 : 320);
    },
    [currentNodeId, isTransitioning, nodeMap, settings.reducedMotion],
  );

  const completionSummary = useMemo(() => {
    if (!currentNode.isEnding || !currentNode.endingType) {
      return null;
    }

    const finalTotal =
      currentNode.endingType === "bad" ? lastEffect?.total ?? badTotal : lastEffect?.total ?? 0;
    const savedAmount =
      currentNode.endingType === "good"
        ? Math.max(badTotal - (lastEffect?.total ?? 0), 0)
        : undefined;

    return {
      scenarioId: scenario.id,
      endingType: currentNode.endingType,
      finalTotal,
      savedAmount,
      completedAt: new Date().toISOString(),
    } satisfies CompletionSummary;
  }, [badTotal, currentNode, lastEffect, scenario.id]);

  useEffect(() => {
    onSessionChange({
      scenarioId: scenario.id,
      currentNodeId,
      history,
      completedTypingNodeId,
      completedEffectNodeId,
      lastEffect,
    });
  }, [
    completedEffectNodeId,
    completedTypingNodeId,
    currentNodeId,
    history,
    lastEffect,
    onSessionChange,
    scenario.id,
  ]);

  useEffect(() => {
    if (!completionSummary) {
      completionRef.current = null;
      return;
    }

    const signature = `${completionSummary.scenarioId}:${completionSummary.endingType}:${completionSummary.finalTotal}`;
    if (completionRef.current === signature) {
      return;
    }

    completionRef.current = signature;
    onComplete(completionSummary);
  }, [completionSummary, onComplete]);

  useEffect(() => {
    if (
      !currentNode.delay ||
      !currentNode.next ||
      currentNode.isEnding ||
      hasChoices ||
      !canInteract
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      transitionTo(currentNode.next as string);
    }, currentNode.delay);

    return () => window.clearTimeout(timeout);
  }, [canInteract, currentNode.delay, currentNode.isEnding, currentNode.next, hasChoices, transitionTo]);

  function handleBack() {
    if (!history.length || isTransitioning) {
      return;
    }

    const nextHistory = [...history];
    const previousNodeId = nextHistory.pop();

    if (!previousNodeId) {
      return;
    }

    setIsTransitioning(true);
    window.setTimeout(() => {
      setCompletedTypingNodeId(null);
      setCompletedEffectNodeId(null);
      setHistory(nextHistory);
      setCurrentNodeId(previousNodeId);
    }, settings.reducedMotion ? 20 : 180);
    window.setTimeout(() => setIsTransitioning(false), settings.reducedMotion ? 30 : 320);
  }

  function handleReplay() {
    completionRef.current = null;
    setHistory([]);
    setCurrentNodeId("intro");
    setLastEffect(null);
    setCompletedTypingNodeId(null);
    setCompletedEffectNodeId(null);
  }

  const sceneToneClass =
    currentNode.effect?.type === "damage"
      ? "bg-[#f8e3dd]"
      : currentNode.effect?.type === "saved" || currentNode.endingType === "good"
        ? "bg-[#e6f3ea]"
        : "bg-[#eddcc9]";

  if (currentNode.isEnding && completionSummary) {
    return (
      <SimulatorResult
        scenario={scenario}
        endingNode={currentNode}
        lastEffect={lastEffect}
        badTotal={badTotal}
        onReplay={handleReplay}
        onExit={onExit}
        savedAmount={completionSummary.savedAmount}
      />
    );
  }

  return (
    <div className={`simulator-root flex flex-col transition-colors duration-500 ${sceneToneClass}`}>
      <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-2 pt-14">
        <div className="absolute left-4 top-4 z-20">
          <button
            type="button"
            onClick={handleBack}
            disabled={!history.length}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border-[2px] border-black bg-white/85 px-3 text-sm font-bold text-black shadow-sm disabled:opacity-40"
          >
            <ArrowLeft className="size-4" />
            {t("simulatorBack")}
          </button>
        </div>
        <div className="absolute right-4 top-4 z-20">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border-[2px] border-black bg-white/85 px-3 text-sm font-bold text-black shadow-sm"
          >
            <X className="size-4" />
            {t("simulatorExit")}
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[rgba(255,255,255,0.35)]" />

        <div className="relative flex flex-1 items-end justify-center">
          <div className="absolute bottom-10 h-5 w-40 rounded-full bg-black/10 blur-md" />
          <div className="relative z-10 h-[40svh] max-h-[360px] w-full max-w-[260px]">
            <SafiCharacter emotion={emotion} className="mx-auto h-full w-full max-w-[240px]" />
          </div>
        </div>
      </section>

      <DialogueBox
        key={currentNode.id}
        speaker={currentNode.speaker}
        text={currentNode.text}
        onAdvance={currentNode.next ? () => transitionTo(currentNode.next as string) : undefined}
        canAdvance={canInteract}
        allowTextTapAdvance={Boolean(currentNode.next && !hasChoices && !currentNode.delay)}
        onTypingChange={(done) => {
          setCompletedTypingNodeId(done ? currentNode.id : null);
        }}
      >
        {currentNode.effect ? (
          currentNode.effect.type === "damage" ? (
            <DamageReveal
              effect={currentNode.effect}
              onComplete={() => {
                setLastEffect(currentNode.effect ?? null);
                setCompletedEffectNodeId(currentNode.id);
              }}
            />
          ) : (
            <SavingsReveal
              effect={currentNode.effect}
              onComplete={() => {
                setLastEffect(currentNode.effect ?? null);
                setCompletedEffectNodeId(currentNode.id);
              }}
            />
          )
        ) : null}

        {currentNode.choices?.length ? (
          <ChoiceButtons
            choices={currentNode.choices}
            disabled={!canInteract}
            onSelect={(nextNodeId) => transitionTo(nextNodeId)}
          />
        ) : null}

        {currentNode.showInsuranceTip && !currentNode.isEnding ? (
          <div className="rounded-[1rem] bg-[#FFF1DD] px-3 py-3 text-sm leading-6 text-black/75">
            <span className="block text-[11px] font-bold uppercase tracking-[0.22em] text-black/55">
              {t("simulatorInsuranceTip")}
            </span>
            <p className="mt-1">{currentNode.showInsuranceTip}</p>
          </div>
        ) : null}

        {currentNode.next && !hasChoices && !currentNode.delay ? (
          <div className="mt-1 flex justify-end">
            <button
              type="button"
              onClick={() => transitionTo(currentNode.next as string)}
              disabled={!canInteract}
              className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {t("simulatorNext")} →
            </button>
          </div>
        ) : null}
      </DialogueBox>
    </div>
  );
}
