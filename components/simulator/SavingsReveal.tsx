"use client";

import { EffectRevealBase, type EffectRevealProps } from "@/components/simulator/DamageReveal";

export function SavingsReveal({ effect, onComplete }: EffectRevealProps) {
  return <EffectRevealBase effect={effect} onComplete={onComplete} />;
}
