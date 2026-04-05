"use client";

import { ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

import { useAccessibility } from "@/hooks/useAccessibility";
import { FloatingIcon } from "@/components/simulator/FloatingIcon";
import { AnimatedCheckmark } from "@/components/simulator/AnimatedCheckmark";
import { AnimatedRewardValue } from "@/components/simulator/AnimatedRewardValue";
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
  const reduceMotion = settings.reducedMotion || prefersReducedMotion;
  const theme = useMemo(() => getGamifiedTheme(themeColor, index), [index, themeColor]);
  const [primaryAccentIcon, secondaryAccentIcon] = theme.accentIcons;
  const isPositiveReward = (rewardValue ?? 0) >= 0;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06, ease: "easeOut" }}
      whileHover={reduceMotion ? undefined : { scale: 1.025, y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      className="relative flex min-h-20 w-full items-center gap-4 overflow-hidden rounded-[1.4rem] border-[2px] border-black bg-white px-4 py-4 text-left shadow-[0_14px_36px_rgba(17,24,39,0.08)]"
      style={{
        boxShadow: `0 18px 46px rgba(17,24,39,0.08), 0 0 0 1px ${theme.glow}`,
      }}
    >
      <motion.span
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle at 86% 50%, ${theme.glow}, transparent 32%), radial-gradient(circle at 12% 50%, ${theme.soft}, transparent 24%)`,
          opacity: 0.85,
        }}
        animate={reduceMotion ? undefined : { opacity: [0.72, 0.94, 0.72] }}
        transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
      />

      {!reduceMotion ? (
        <div className="pointer-events-none absolute inset-y-0 right-24 hidden md:block">
          <FloatingIcon
            icon={primaryAccentIcon}
            color={theme.tint}
            className="absolute right-16 top-7"
            delay={index * 0.2}
            reduceMotion={reduceMotion}
          />
          <FloatingIcon
            icon={secondaryAccentIcon}
            color={theme.tint}
            className="absolute right-7 top-14"
            delay={index * 0.2 + 0.35}
            size={15}
            reduceMotion={reduceMotion}
          />
          <motion.span
            className="absolute right-12 top-11 h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: theme.tint }}
            animate={{ opacity: [0.18, 0.58, 0.18], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity, delay: index * 0.15 }}
          />
        </div>
      ) : null}

      <motion.span
        className="relative z-10 grid h-12 w-12 place-items-center rounded-2xl text-2xl"
        style={{
          backgroundColor: theme.soft,
          boxShadow: `0 0 0 1px ${theme.glow}, 0 0 24px ${theme.iconGlow}`,
        }}
        animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
        transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity, delay: index * 0.1 }}
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
            style={{ backgroundColor: theme.soft, color: theme.chipText }}
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
          <span className="mt-2 flex items-center gap-2 text-xs font-medium text-black/78">
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
            {!reduceMotion ? (
              <span className="relative ml-1 inline-flex h-5 w-7 items-center">
                <FloatingIcon
                  icon={primaryAccentIcon}
                  color={theme.tint}
                  size={14}
                  className="absolute left-0 top-0"
                  delay={0.1}
                />
                <FloatingIcon
                  icon={secondaryAccentIcon}
                  color={theme.tint}
                  size={12}
                  className="absolute left-3 top-1"
                  delay={0.35}
                />
              </span>
            ) : null}
          </span>
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
            className="h-20 w-20"
            color={theme.arrow}
            glow={theme.soft}
            reduceMotion={reduceMotion}
          />
        </motion.div>
      ) : null}

      <motion.span
        className="relative z-10 mr-1 inline-flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          color: theme.arrow,
          boxShadow: `0 0 0 1px ${theme.glow}`,
          backgroundColor: "rgba(255,255,255,0.84)",
        }}
        animate={reduceMotion ? undefined : { scale: [1, 1.04, 1], x: [0, 1, 0] }}
        transition={{ duration: 2.8, ease: "easeInOut", repeat: Infinity }}
      >
        <motion.span
          whileHover={reduceMotion ? undefined : { x: 4 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <ChevronRight className="size-6" strokeWidth={2.2} />
        </motion.span>
      </motion.span>
    </motion.button>
  );
}
