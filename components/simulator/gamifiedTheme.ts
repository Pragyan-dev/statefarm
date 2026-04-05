"use client";

import type { LucideIcon } from "lucide-react";
import { Coins, Heart, Shield, Sparkles } from "lucide-react";

export type ThemeColorKey = "green" | "blue" | "orange" | "red" | "purple";

export interface GamifiedTheme {
  key: ThemeColorKey;
  tint: string;
  strong: string;
  soft: string;
  glow: string;
  iconGlow: string;
  chipText: string;
  arrow: string;
  border: string;
  backgroundFrom: string;
  backgroundTo: string;
  highlight: string;
  shadow: string;
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
    border: "rgba(68, 126, 76, 0.92)",
    backgroundFrom: "rgba(243, 255, 245, 0.98)",
    backgroundTo: "rgba(225, 248, 228, 0.94)",
    highlight: "rgba(255, 255, 255, 0.88)",
    shadow: "rgba(96, 194, 113, 0.22)",
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
    border: "rgba(45, 98, 150, 0.92)",
    backgroundFrom: "rgba(244, 250, 255, 0.98)",
    backgroundTo: "rgba(228, 241, 255, 0.94)",
    highlight: "rgba(255, 255, 255, 0.9)",
    shadow: "rgba(112, 178, 242, 0.2)",
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
    border: "rgba(163, 108, 29, 0.9)",
    backgroundFrom: "rgba(255, 250, 241, 0.98)",
    backgroundTo: "rgba(253, 239, 211, 0.94)",
    highlight: "rgba(255, 255, 255, 0.9)",
    shadow: "rgba(239, 173, 69, 0.22)",
    accentIcons: [Sparkles, Heart],
  },
  {
    key: "red",
    tint: "#f2a0a5",
    strong: "#9a4554",
    soft: "rgba(242, 160, 165, 0.2)",
    glow: "rgba(242, 160, 165, 0.32)",
    iconGlow: "rgba(242, 160, 165, 0.48)",
    chipText: "#994a50",
    arrow: "#d96a74",
    border: "rgba(132, 39, 53, 0.9)",
    backgroundFrom: "rgba(255, 245, 246, 0.98)",
    backgroundTo: "rgba(253, 228, 232, 0.94)",
    highlight: "rgba(255, 255, 255, 0.9)",
    shadow: "rgba(217, 106, 116, 0.24)",
    accentIcons: [Heart, Sparkles],
  },
  {
    key: "purple",
    tint: "#c4b0ff",
    strong: "#6349a6",
    soft: "rgba(196, 176, 255, 0.2)",
    glow: "rgba(196, 176, 255, 0.32)",
    iconGlow: "rgba(196, 176, 255, 0.46)",
    chipText: "#6a50a7",
    arrow: "#9d7df1",
    border: "rgba(90, 63, 156, 0.9)",
    backgroundFrom: "rgba(249, 246, 255, 0.98)",
    backgroundTo: "rgba(238, 231, 255, 0.94)",
    highlight: "rgba(255, 255, 255, 0.88)",
    shadow: "rgba(157, 125, 241, 0.22)",
    accentIcons: [Heart, Sparkles],
  },
];

export function getGamifiedTheme(themeColor: string | undefined, index: number) {
  const explicit = themes.find((theme) => theme.key === themeColor);
  return explicit ?? themes[index % themes.length];
}
