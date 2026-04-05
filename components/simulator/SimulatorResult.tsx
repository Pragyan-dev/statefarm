"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { useAccessibility } from "@/hooks/useAccessibility";
import { formatCurrency } from "@/lib/content";
import type { DialogueNode, FinancialEffect, Scenario } from "@/types/simulator";

interface SimulatorResultProps {
  scenario: Scenario;
  endingNode: DialogueNode;
  lastEffect: FinancialEffect | null;
  badTotal: number;
  onReplay: () => void;
  onExit: () => void;
  savedAmount?: number;
}

export function SimulatorResult({
  scenario,
  endingNode,
  lastEffect,
  badTotal,
  onReplay,
  onExit,
  savedAmount,
}: SimulatorResultProps) {
  const t = useTranslations();
  const { settings } = useAccessibility();
  const [copied, setCopied] = useState(false);
  const isGood = endingNode.endingType === "good";

  const titleAmount = isGood
    ? formatCurrency(savedAmount ?? 0, settings.language)
    : formatCurrency(lastEffect?.total ?? badTotal, settings.language);

  const shareText = isGood
    ? `I played ArriveSafe's ${scenario.title} scenario and saw how insurance could save ${titleAmount}.`
    : `I played ArriveSafe's ${scenario.title} scenario and saw how fast life can turn into a ${titleAmount} problem without insurance.`;

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={`flex min-h-[100dvh] flex-col ${
        isGood
          ? "bg-gradient-to-b from-green-50 via-[#F6FFF7] to-white"
          : "bg-gradient-to-b from-red-50 via-[#FFF8F5] to-white"
      }`}
    >
      <div className="flex flex-1 flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-6">
        <div className="rounded-[2rem] border-[2px] border-black bg-white px-5 py-5 shadow-[0_24px_70px_rgba(17,24,39,0.14)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/55">
            {scenario.title}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-none text-black">
            {isGood ? `${t("simulatorYouSaved")} ${titleAmount}` : titleAmount}
          </h1>
          <p className="mt-4 text-base leading-7 text-black/75">{endingNode.text}</p>

          {isGood ? (
            <section className="mt-5 rounded-[1.25rem] border border-[var(--color-success)]/20 bg-[rgba(31,122,90,0.08)] px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-success)]">
                {t("simulatorProtected")}
              </p>
              <p className="mt-2 text-sm leading-6 text-black/70">
                {lastEffect?.monthlyEquivalent ??
                  "The covered version of this story keeps the emergency stressful, but affordable."}
              </p>
            </section>
          ) : (
            <section className="mt-5 rounded-[1.25rem] border border-[var(--color-danger)]/20 bg-[rgba(182,70,59,0.08)] px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-danger)]">
                {t("simulatorGoodNews")}
              </p>
              <p className="mt-2 text-sm leading-6 text-black/70">
                {endingNode.showInsuranceTip}
              </p>
            </section>
          )}

          {lastEffect?.items?.length ? (
            <div className="mt-5 grid gap-2">
              {lastEffect.items.map((item) => (
                <div
                  key={`${item.label}-${item.amount}`}
                  className="flex items-center justify-between rounded-[1rem] bg-stone-50 px-3 py-3"
                >
                  <span className="text-sm font-medium text-black/75">
                    {item.icon ? `${item.icon} ` : ""}
                    {item.label}
                  </span>
                  <span className="text-sm font-extrabold text-black">
                    {item.amount > 0 ? formatCurrency(item.amount, settings.language) : "Included"}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {endingNode.showInsuranceTip && isGood ? (
            <section className="mt-5 rounded-[1.25rem] border border-black/10 bg-[#FFF7E8] px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-black/60">
                {t("simulatorInsuranceTip")}
              </p>
              <p className="mt-2 text-sm leading-6 text-black/70">{endingNode.showInsuranceTip}</p>
            </section>
          ) : null}

          <div className="mt-6 grid gap-3">
            {endingNode.actionCTA ? (
              <Link
                href={endingNode.actionCTA.href}
                className="rounded-full bg-black px-5 py-3 text-center text-sm font-bold text-white"
              >
                {endingNode.actionCTA.label}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={onReplay}
              className="rounded-full border-[2px] border-black bg-[#FAF4EA] px-5 py-3 text-sm font-bold text-black"
            >
              {isGood ? t("simulatorReplay") : t("simulatorReplayWithInsurance")}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full border-[2px] border-black/15 bg-white px-5 py-3 text-sm font-bold text-black"
            >
              {copied ? t("simulatorCopied") : t("simulatorShare")}
            </button>
            <button
              type="button"
              onClick={onExit}
              className="rounded-full border-[2px] border-black/15 bg-white px-5 py-3 text-sm font-bold text-black"
            >
              {t("simulatorNextScenario")} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
