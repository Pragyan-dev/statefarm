"use client";

import { createContext, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { AccessibilitySettings } from "@/lib/types";

export const defaultAccessibilitySettings: AccessibilitySettings = {
  language: "en",
  textSize: "normal",
  highContrast: false,
  colorBlindMode: "none",
  reducedMotion: false,
  screenReaderOptimized: false,
  voiceOutput: false,
  voiceSpeed: 0.9,
};

export const AccessibilityContext = createContext<{
  settings: AccessibilitySettings;
  setSettings: Dispatch<SetStateAction<AccessibilitySettings>>;
  resetSettings: () => void;
} | null>(null);

export function AccessibilityProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, setSettings] = useLocalStorage<AccessibilitySettings>(
    "arrivesafe-accessibility",
    defaultAccessibilitySettings,
  );

  const value = useMemo(
    () => ({
      settings,
      setSettings,
      resetSettings: () => setSettings(defaultAccessibilitySettings),
    }),
    [setSettings, settings],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}
