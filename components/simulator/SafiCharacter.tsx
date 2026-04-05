"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

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

export function SafiCharacter({ emotion, className = "" }: SafiCharacterProps) {
  const t = useTranslations();
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const asset = emotionAssetMap[emotion];

  return (
    <div className={`relative ${settings.reducedMotion ? "" : "sim-safi-idle"} ${className}`}>
      <Image
        src={asset.src}
        alt={
          isSpanish
            ? `${t("simulatorSafi")} mirando ${emotion}`
            : `${t("simulatorSafi")} looking ${emotion}`
        }
        width={asset.width}
        height={asset.height}
        className="h-full w-full object-contain drop-shadow-[0_18px_30px_rgba(17,24,39,0.14)]"
        priority
      />
    </div>
  );
}
