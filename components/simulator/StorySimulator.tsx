"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { ChoiceButtons } from "@/components/simulator/ChoiceButtons";
import { DamageReveal } from "@/components/simulator/DamageReveal";
import { DialogueScene } from "@/components/simulator/DialogueScene";
import { SavingsReveal } from "@/components/simulator/SavingsReveal";
import { SimulatorResult } from "@/components/simulator/SimulatorResult";
import { getSafiMascotAsset } from "@/components/simulator/SafiCharacter";
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
  const isSpanish = settings.language === "es";
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
  const transitionTimeoutRef = useRef<number | null>(null);
  const transitionResetRef = useRef<number | null>(null);

  const currentNode = nodeMap.get(currentNodeId) as DialogueNode;
  const emotion = currentNode.emotion ?? "neutral";
  const hasChoices = Boolean(currentNode.choices?.length);
  const isTextDone = completedTypingNodeId === currentNodeId;
  const isEffectComplete = !currentNode.effect || completedEffectNodeId === currentNodeId;
  const canInteract = isTextDone && isEffectComplete && !isTransitioning;

  const clearTransitionTimers = useCallback(() => {
    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    if (transitionResetRef.current) {
      window.clearTimeout(transitionResetRef.current);
      transitionResetRef.current = null;
    }
  }, []);

  const transitionTo = useCallback(
    (nextNodeId: string) => {
      if (isTransitioning || !nodeMap.has(nextNodeId)) {
        return;
      }

      clearTransitionTimers();
      setIsTransitioning(true);

      transitionTimeoutRef.current = window.setTimeout(() => {
        setCompletedTypingNodeId(null);
        setCompletedEffectNodeId(null);
        setHistory((currentHistory) => [...currentHistory, currentNodeId]);
        setCurrentNodeId(nextNodeId);
      }, settings.reducedMotion ? 20 : 150);

      transitionResetRef.current = window.setTimeout(() => {
        setIsTransitioning(false);
      }, settings.reducedMotion ? 30 : 240);
    },
    [clearTransitionTimers, currentNodeId, isTransitioning, nodeMap, settings.reducedMotion],
  );

  const completionSummary =
    !currentNode.isEnding || !currentNode.endingType
      ? null
      : ({
          scenarioId: scenario.id,
          endingType: currentNode.endingType,
          finalTotal:
            currentNode.endingType === "bad" ? lastEffect?.total ?? badTotal : lastEffect?.total ?? 0,
          savedAmount:
            currentNode.endingType === "good"
              ? Math.max(badTotal - (lastEffect?.total ?? 0), 0)
              : undefined,
          completedAt: new Date().toISOString(),
        } satisfies CompletionSummary);

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
    return () => {
      clearTransitionTimers();
    };
  }, [clearTransitionTimers]);

  function handleBack() {
    if (!history.length || isTransitioning) {
      return;
    }

    const nextHistory = [...history];
    const previousNodeId = nextHistory.pop();

    if (!previousNodeId) {
      return;
    }

    clearTransitionTimers();
    setIsTransitioning(true);
    transitionTimeoutRef.current = window.setTimeout(() => {
      setCompletedTypingNodeId(null);
      setCompletedEffectNodeId(null);
      setHistory(nextHistory);
      setCurrentNodeId(previousNodeId);
    }, settings.reducedMotion ? 20 : 150);
    transitionResetRef.current = window.setTimeout(
      () => setIsTransitioning(false),
      settings.reducedMotion ? 30 : 240,
    );
  }

  function handleReplay() {
    completionRef.current = null;
    setHistory([]);
    setCurrentNodeId("intro");
    setLastEffect(null);
    setCompletedTypingNodeId(null);
    setCompletedEffectNodeId(null);
  }

  const sceneToneStyle =
    currentNode.effect?.type === "damage"
      ? {
          backgroundColor: "#f6ded6",
          backgroundImage:
            "radial-gradient(circle at 18% 16%, rgba(255,255,255,0.78), transparent 28%), radial-gradient(circle at 84% 14%, rgba(182,70,59,0.18), transparent 24%), linear-gradient(180deg, #FAECE7 0%, #F2D8D0 100%)",
        }
      : currentNode.effect?.type === "saved" || currentNode.endingType === "good"
        ? {
            backgroundColor: "#e6f2e7",
            backgroundImage:
              "radial-gradient(circle at 20% 18%, rgba(255,255,255,0.72), transparent 30%), radial-gradient(circle at 82% 16%, rgba(31,122,90,0.14), transparent 24%), linear-gradient(180deg, #EFF8F0 0%, #DDEEDD 100%)",
          }
        : {
            backgroundColor: "#efe3d3",
            backgroundImage:
              "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.72), transparent 28%), radial-gradient(circle at 84% 16%, rgba(161,201,117,0.16), transparent 24%), linear-gradient(180deg, #F7F0E4 0%, #E9DBC8 100%)",
          };

  const speakerLabel =
    currentNode.speaker === "safi"
      ? t("simulatorSafi")
      : currentNode.speaker === "system"
        ? isSpanish
          ? "Sistema"
          : "System"
        : isSpanish
          ? "Narrador"
          : "Narrator";

  const defaultMascot = getSafiMascotAsset(emotion);
  const mascot = {
    src: currentNode.mascot?.src ?? defaultMascot.src,
    width: currentNode.mascot?.width ?? defaultMascot.width,
    height: currentNode.mascot?.height ?? defaultMascot.height,
    alt:
      currentNode.mascot?.alt ??
      (isSpanish
        ? `${t("simulatorSafi")} con expresion ${emotion}`
        : `${t("simulatorSafi")} with a ${emotion} expression`),
    mood: currentNode.mascot?.mood ?? emotion,
  };

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
    <div className="simulator-root relative flex flex-col transition-colors duration-300" style={sceneToneStyle}>
      <section className="relative flex min-h-dvh flex-1 flex-col overflow-y-auto px-4 pb-6 pt-16 sm:px-6 lg:px-8">
        <div className="absolute left-4 top-4 z-20">
          <button
            type="button"
            onClick={handleBack}
            disabled={!history.length}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border-[2px] border-black bg-white/88 px-4 text-sm font-bold text-black shadow-[0_14px_30px_rgba(17,24,39,0.1)] backdrop-blur-sm transition hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <ArrowLeft className="size-4" />
            {t("simulatorBack")}
          </button>
        </div>
        <div className="absolute right-4 top-4 z-20">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border-[2px] border-black bg-white/88 px-4 text-sm font-bold text-black shadow-[0_14px_30px_rgba(17,24,39,0.1)] backdrop-blur-sm transition hover:-translate-y-0.5"
          >
            <X className="size-4" />
            {t("simulatorExit")}
          </button>
        </div>

        <DialogueScene
          dialogueKey={currentNode.id}
          speaker={currentNode.speaker}
          speakerLabel={speakerLabel}
          text={currentNode.text}
          mascot={mascot}
          onAdvance={currentNode.next ? () => transitionTo(currentNode.next as string) : undefined}
          canAdvance={canInteract}
          allowTextTapAdvance={Boolean(currentNode.next && !hasChoices)}
          onTypingChange={(done) => {
            setCompletedTypingNodeId(done ? currentNode.id : null);
          }}
          footer={
            currentNode.next && !hasChoices ? (
              <motion.button
                type="button"
                onClick={() => transitionTo(currentNode.next as string)}
                disabled={!canInteract}
                whileHover={settings.reducedMotion ? undefined : { scale: 1.03, boxShadow: "0 18px 34px rgba(17,24,39,0.26)" }}
                whileTap={settings.reducedMotion ? undefined : { scale: 0.97 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-black px-5 text-sm font-bold text-white shadow-[0_14px_24px_rgba(17,24,39,0.18)] disabled:opacity-50 disabled:shadow-none"
              >
                {t("simulatorNext")} →
              </motion.button>
            ) : undefined
          }
        >
          {currentNode.effect ? (
            currentNode.effect.type === "damage" ? (
              <DamageReveal
                key={currentNode.id}
                effect={currentNode.effect}
                onComplete={() => {
                  setLastEffect(currentNode.effect ?? null);
                  setCompletedEffectNodeId(currentNode.id);
                }}
              />
            ) : (
              <SavingsReveal
                key={currentNode.id}
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
              key={currentNode.id}
              choices={currentNode.choices}
              disabled={!canInteract}
              onSelect={(nextNodeId) => transitionTo(nextNodeId)}
            />
          ) : null}

          {currentNode.showInsuranceTip && !currentNode.isEnding ? (
            <div className="rounded-[1.25rem] border border-black/10 bg-[#FFF2DE] px-4 py-3 text-sm leading-6 text-black/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
              <span className="block text-[11px] font-bold uppercase tracking-[0.22em] text-black/55">
                {t("simulatorInsuranceTip")}
              </span>
              <p className="mt-1">{currentNode.showInsuranceTip}</p>
            </div>
          ) : null}
        </DialogueScene>
      </section>
    </div>
  );
}
