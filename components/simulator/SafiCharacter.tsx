"use client";

import { useTranslations } from "next-intl";

import { Mascot } from "@/components/simulator/Mascot";
import { useAccessibility } from "@/hooks/useAccessibility";
import type { Emotion } from "@/types/simulator";

interface SafiCharacterProps {
  emotion: Emotion;
  className?: string;
}

const emotionAssetMap: Record<Emotion, { src: string; width: number; height: number }> = {
  neutral: {
    src: "/mascot/thinking.png",
    width: 488,
    height: 512,
  },
  happy: {
    src: "/mascot/calm.png",
    width: 519,
    height: 480,
  },
  worried: {
    src: "/mascot/warning.png",
    width: 549,
    height: 455,
  },
  shocked: {
    src: "/mascot/shocked.png",
    width: 500,
    height: 499,
  },
  celebrating: {
    src: "/mascot/calm.png",
    width: 519,
    height: 480,
  },
  hurt: {
    src: "/mascot/hurt.png",
    width: 440,
    height: 607,
  },
};

export function getSafiMascotAsset(emotion: Emotion) {
  return emotionAssetMap[emotion] ?? emotionAssetMap.neutral;
}

export function SafiCharacter({ emotion, className = "" }: SafiCharacterProps) {
  const t = useTranslations();
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const asset = getSafiMascotAsset(emotion);

  return (
    <Mascot
      mascotImage={asset.src}
      alt={
        isSpanish
          ? `${t("simulatorSafi")} con expresion ${emotion}`
          : `${t("simulatorSafi")} with a ${emotion} expression`
      }
      width={asset.width}
      height={asset.height}
      mood={emotion}
      className={className}
      priority
    />
  );
}
