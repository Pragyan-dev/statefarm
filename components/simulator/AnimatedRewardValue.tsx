"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { useAccessibility } from "@/hooks/useAccessibility";
import { formatCurrency } from "@/lib/content";

interface AnimatedRewardValueProps {
  amount: number;
  positive: boolean;
}

export function AnimatedRewardValue({ amount, positive }: AnimatedRewardValueProps) {
  const { settings } = useAccessibility();
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = settings.reducedMotion || prefersReducedMotion;
  const motionValue = useMotionValue(reduceMotion ? amount : 0);
  const [animatedValue, setAnimatedValue] = useState(reduceMotion ? amount : 0);

  useMotionValueEvent(motionValue, "change", (latest) => {
    if (!reduceMotion) {
      setAnimatedValue(Math.round(latest));
    }
  });

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(amount);
      return;
    }

    const controls = animate(motionValue, amount, {
      duration: 0.7,
      ease: "easeOut",
    });

    return () => controls.stop();
  }, [amount, motionValue, reduceMotion]);

  const displayValue = formatCurrency(reduceMotion ? amount : animatedValue, settings.language);

  return (
    <motion.span
      initial={reduceMotion ? false : { opacity: 0, y: 5 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="inline-flex items-center"
    >
      {positive ? displayValue : displayValue}
    </motion.span>
  );
}
