"use client";

import type { LucideIcon } from "lucide-react";
import { Coins, Heart, Shield, Sparkles } from "lucide-react";

export type ThemeColorKey = "green" | "blue" | "orange" | "rose";

export interface GamifiedTheme {
  key: ThemeColorKey;
  tint: string;
  strong: string;
  soft: string;
  glow: string;
  iconGlow: string;
  chipText: string;
  arrow: string;
  accentIcons: LucideIcon[];
}

const themes: GamifiedTheme[] = [
  {
    key: "green",
    tint: "#79d88f",
    strong: "#287a42",
    soft: "rgba(117, 217, 142, 0.18)",
    glow: "rgba(117, 217, 142, 0.32)",
    iconGlow: "rgba(117, 217, 142, 0.46)",
    chipText: "#2d7a3f",
    arrow: "#5bc974",
    accentIcons: [Coins, Sparkles],
  },
  {
    key: "blue",
    tint: "#7fc8ff",
    strong: "#2d6e9f",
    soft: "rgba(127, 200, 255, 0.2)",
    glow: "rgba(127, 200, 255, 0.3)",
    iconGlow: "rgba(127, 200, 255, 0.45)",
    chipText: "#2f6d99",
    arrow: "#69bcfb",
    accentIcons: [Shield, Sparkles],
  },
  {
    key: "orange",
    tint: "#f7c16e",
    strong: "#a06417",
    soft: "rgba(247, 193, 110, 0.22)",
    glow: "rgba(247, 193, 110, 0.32)",
    iconGlow: "rgba(247, 193, 110, 0.5)",
    chipText: "#9a6118",
    arrow: "#efad45",
    accentIcons: [Sparkles, Heart],
  },
  {
    key: "rose",
    tint: "#f4a4a2",
    strong: "#a14d4a",
    soft: "rgba(244, 164, 162, 0.2)",
    glow: "rgba(244, 164, 162, 0.3)",
    iconGlow: "rgba(244, 164, 162, 0.45)",
    chipText: "#9b4a47",
    arrow: "#df7d79",
    accentIcons: [Heart, Sparkles],
  },
];

export function getGamifiedTheme(themeColor: string | undefined, index: number) {
  const explicit = themes.find((theme) => theme.key === themeColor);
  return explicit ?? themes[index % themes.length];
}
