"use client";

import Image from "next/image";
import { domAnimation, LazyMotion, motion, useReducedMotion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { GamifiedCard } from "@/components/simulator/GamifiedCard";
import { FloatingIcon } from "@/components/simulator/FloatingIcon";
import { getGamifiedTheme } from "@/components/simulator/gamifiedTheme";
import { useAccessibility } from "@/hooks/useAccessibility";
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
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = settings.reducedMotion || prefersReducedMotion;
  const leadTheme = getGamifiedTheme(scenarios[0]?.themeColor, 0);

  return (
    <LazyMotion features={domAnimation}>
      <div className="simulator-root relative bg-[linear-gradient(180deg,#FFFFFF_0%,#FAF8F4_100%)] px-4 py-6">
        {!reduceMotion ? (
          <>
            <motion.div
              className="pointer-events-none absolute left-0 top-0 h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              aria-hidden="true"
            >
              <div className="sim-picker-grid" />
              <motion.svg
                viewBox="0 0 640 420"
                className="absolute left-[17%] top-[4.2rem] hidden h-[420px] w-[640px] lg:block"
              >
                <motion.path
                  d="M125 60 C 255 70, 312 160, 370 246"
                  fill="none"
                  stroke={leadTheme.tint}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="2 18"
                  animate={{ strokeDashoffset: [0, -42] }}
                  transition={{ duration: 2.6, ease: "linear", repeat: Infinity }}
                  opacity="0.55"
                />
                <motion.circle
                  cx="368"
                  cy="244"
                  r="7"
                  fill={leadTheme.tint}
                  animate={{ scale: [0.85, 1.18, 0.85], opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
                />
              </motion.svg>
            </motion.div>

            <motion.div
              className="pointer-events-none absolute left-[-2rem] top-10 h-44 w-44 rounded-full blur-3xl"
              style={{ backgroundColor: leadTheme.glow }}
              animate={{ opacity: [0.18, 0.36, 0.18], scale: [0.95, 1.08, 0.95] }}
              transition={{ duration: 5.4, ease: "easeInOut", repeat: Infinity }}
              aria-hidden="true"
            />
          </>
        ) : null}

        <section className="relative overflow-hidden rounded-[2rem] border-[2px] border-black bg-transparent px-5 py-5 shadow-none">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-black/50">
              FirstCover
            </p>
            <h1 className="mt-3 font-display text-4xl leading-none text-black">
              {t("simulatorChooseTitle")}
            </h1>
            <p className="mt-4 max-w-[30ch] text-sm leading-6 text-black/70">
              {t("simulatorChooseDescription")}
            </p>
          </motion.div>

          <div className="pointer-events-none absolute inset-y-0 right-0 w-[42%]">
            <motion.div
              className="absolute right-[14%] top-1/2 hidden w-40 -translate-y-1/2 md:block lg:w-48"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 12 }}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      opacity: 1,
                      y: [-5, 5, -5],
                      rotate: [-3, 2, -3],
                      scale: [1, 1.015, 1],
                    }
              }
              transition={{
                duration: 4.2,
                ease: "easeInOut",
                repeat: reduceMotion ? 0 : Infinity,
              }}
            >
              <Image
                src="/mascot/calm.png"
                alt={settings.language === "es" ? "Mascota de FirstCover" : "FirstCover mascot"}
                width={519}
                height={480}
                className="h-auto w-full object-contain drop-shadow-[0_22px_30px_rgba(17,24,39,0.16)]"
                priority
              />
            </motion.div>

            {!reduceMotion ? (
              <>
                <FloatingIcon
                  icon={Heart}
                  color={leadTheme.arrow}
                  className="absolute right-[28%] top-[18%] hidden lg:inline-flex"
                  size={28}
                  delay={0.25}
                />
                <FloatingIcon
                  icon={Sparkles}
                  color={leadTheme.tint}
                  className="absolute right-[20%] top-[24%] hidden lg:inline-flex"
                  size={22}
                  delay={0.55}
                />
              </>
            ) : null}
          </div>
        </section>

        <div className="mt-5 grid gap-3">
          {scenarios.map((scenario, index) => {
            const completion = progress[scenario.id];
            const rewardValue = completion
              ? completion.endingType === "good"
                ? completion.savedAmount ?? 0
                : -(completion.finalTotal ?? 0)
              : undefined;

            return (
              <GamifiedCard
                key={scenario.id}
                title={scenario.title}
                description={scenario.subtitle}
                icon={scenario.icon}
                isCompleted={Boolean(completion)}
                rewardValue={rewardValue}
                themeColor={scenario.themeColor}
                matchReason={scenario.matchReason}
                estimatedTime={scenario.estimatedTime}
                index={index}
                onSelect={() => onSelect(scenario)}
              />
            );
          })}
        </div>
      </div>
    </LazyMotion>
  );
}
