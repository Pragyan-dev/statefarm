"use client";

import { ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

import { useAccessibility } from "@/hooks/useAccessibility";
import { AnimatedCheckmark } from "@/components/simulator/AnimatedCheckmark";
import { AnimatedRewardValue } from "@/components/simulator/AnimatedRewardValue";
import { FloatingParticles } from "@/components/simulator/FloatingParticles";
import { getGamifiedTheme } from "@/components/simulator/gamifiedTheme";

interface GamifiedCardProps {
  title: string;
  description: string;
  icon: string;
  isCompleted: boolean;
  rewardValue?: number;
  themeColor?: string;
  matchReason?: string;
  estimatedTime: string;
  index: number;
  onSelect: () => void;
}

export function GamifiedCard({
  title,
  description,
  icon,
  isCompleted,
  rewardValue,
  themeColor,
  matchReason,
  estimatedTime,
  index,
  onSelect,
}: GamifiedCardProps) {
  const { settings } = useAccessibility();
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = settings.reducedMotion || Boolean(prefersReducedMotion);
  const theme = useMemo(() => getGamifiedTheme(themeColor, index), [index, themeColor]);
  const isPositiveReward = (rewardValue ?? 0) >= 0;
  const cardVariants = {
    rest: {
      scale: 1,
      y: 0,
      boxShadow: `0 16px 34px rgba(17,24,39,0.08), 0 0 0 1px ${theme.border}`,
    },
    hover: {
      scale: 1.02,
      y: -2,
      boxShadow: `0 22px 46px rgba(17,24,39,0.1), 0 0 22px ${theme.glow}, 0 0 0 1px ${theme.border}`,
    },
    tap: {
      scale: 0.985,
      y: 0,
      boxShadow: `0 16px 30px rgba(17,24,39,0.08), 0 0 16px ${theme.glow}, 0 0 0 1px ${theme.border}`,
    },
  } as const;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06, ease: "easeOut" }}
    >
      <motion.button
        type="button"
        onClick={onSelect}
        initial="rest"
        animate="rest"
        whileHover={reduceMotion ? undefined : "hover"}
        whileTap={reduceMotion ? undefined : "tap"}
        variants={cardVariants}
        className="relative flex min-h-20 w-full items-center gap-4 overflow-hidden rounded-[1.4rem] border-[2px] px-4 py-4 text-left"
        style={{ borderColor: theme.border }}
      >
      <motion.span
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background: `linear-gradient(135deg, ${theme.backgroundFrom} 0%, ${theme.backgroundTo} 100%)`,
          opacity: isCompleted ? 1 : 0.96,
        }}
      />
      <motion.span
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle at 18% 16%, ${theme.highlight} 0%, rgba(255,255,255,0) 34%), radial-gradient(circle at 78% 48%, ${theme.glow} 0%, rgba(255,255,255,0) 42%)`,
          opacity: isCompleted ? 0.95 : 0.82,
        }}
        animate={reduceMotion ? undefined : { opacity: [0.72, 0.9, 0.72] }}
        transition={{ duration: 3.1, ease: "easeInOut", repeat: Infinity }}
      />
      <span
        className="absolute inset-x-3 top-2 h-12 rounded-full blur-2xl"
        aria-hidden="true"
        style={{ backgroundColor: theme.highlight, opacity: 0.45 }}
      />

      <FloatingParticles theme={theme} reduceMotion={reduceMotion} />

      <motion.span
        className="relative z-10 grid h-12 w-12 place-items-center rounded-2xl text-2xl"
        style={{
          background: `linear-gradient(180deg, rgba(255,255,255,0.88) 0%, ${theme.soft} 100%)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.92), 0 0 0 1px ${theme.glow}, 0 12px 24px ${theme.shadow}`,
        }}
        variants={{
          rest: { y: 0 },
          hover: { y: -2 },
        }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {icon}
      </motion.span>

      <span className="relative z-10 min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-base font-bold text-black">{title}</span>
          {isCompleted ? (
            <AnimatedCheckmark
              className="h-5 w-5"
              color={theme.strong}
              glow={theme.soft}
              reduceMotion={reduceMotion}
            />
          ) : null}
        </span>

        <span className="mt-1 block truncate text-sm text-black/65">{description}</span>

        {matchReason ? (
          <motion.span
            className="mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold"
            style={{
              background: `linear-gradient(180deg, rgba(255,255,255,0.72) 0%, ${theme.soft} 100%)`,
              color: theme.chipText,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9)`,
            }}
            animate={reduceMotion ? undefined : { y: [0, -1.5, 0] }}
            transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
          >
            {matchReason}
          </motion.span>
        ) : null}

        <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">
          {estimatedTime}
        </span>

        {isCompleted && typeof rewardValue === "number" ? (
          <motion.span
            className="mt-2 flex items-center gap-2 text-xs font-medium text-black/78"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut", delay: 0.06 }}
          >
            <span>
              {settings.language === "es"
                ? isPositiveReward
                  ? "Completado - ahorraste"
                  : "Completado - perdiste"
                : isPositiveReward
                  ? "Completed - you saved"
                  : "Completed - you lost"}
            </span>
            <AnimatedRewardValue amount={Math.abs(rewardValue)} positive={isPositiveReward} />
            {!reduceMotion ? <FloatingParticles theme={theme} reduceMotion={reduceMotion} className="relative ml-1 inline-flex h-5 w-7" density="low" /> : null}
          </motion.span>
        ) : null}
      </span>

      {isCompleted ? (
        <motion.div
          className="pointer-events-none absolute right-28 top-1/2 hidden -translate-y-1/2 md:block"
          initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
          animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.26, ease: "easeOut", delay: 0.08 }}
        >
          <AnimatedCheckmark
            className="h-12 w-12"
            color={theme.strong}
            glow={theme.soft}
            reduceMotion={reduceMotion}
            mode="subtle"
          />
        </motion.div>
      ) : null}

      <motion.span
        className="relative z-10 mr-1 inline-flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          color: theme.arrow,
          border: `1px solid ${theme.glow}`,
          boxShadow: `0 0 0 1px ${theme.glow}, 0 10px 24px ${theme.shadow}`,
          background: `linear-gradient(180deg, rgba(255,255,255,0.94) 0%, ${theme.soft} 100%)`,
        }}
        animate={reduceMotion ? undefined : { scale: [1, 1.04, 1], x: [0, 1, 0], boxShadow: [`0 0 0 1px ${theme.glow}, 0 10px 24px ${theme.shadow}`, `0 0 16px ${theme.glow}, 0 12px 28px ${theme.shadow}`, `0 0 0 1px ${theme.glow}, 0 10px 24px ${theme.shadow}`] }}
        transition={{ duration: 2.8, ease: "easeInOut", repeat: Infinity }}
      >
        <motion.span
          variants={{
            rest: { x: 0 },
            hover: { x: 4 },
          }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <ChevronRight className="size-6" strokeWidth={2.2} />
        </motion.span>
      </motion.span>
      </motion.button>
    </motion.div>
  );
}
