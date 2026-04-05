"use client";

import { createContext, useCallback, useEffect, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { AccessibilitySettings } from "@/lib/types";

type LegacyTextSize = "normal" | "large" | "xl";

interface StoredAccessibilitySettings
  extends Omit<AccessibilitySettings, "textSize"> {
  textSize?: AccessibilitySettings["textSize"] | LegacyTextSize;
}

const TEXT_SIZE_MIN = 16;
const TEXT_SIZE_MAX = 24;

export const defaultAccessibilitySettings: AccessibilitySettings = {
  language: "en",
  textSize: 16,
  highContrast: false,
  colorBlindMode: "none",
  reducedMotion: false,
  screenReaderOptimized: false,
  voiceOutput: false,
  voiceSpeed: 0.9,
};

function clampTextSize(value: number) {
  return Math.min(TEXT_SIZE_MAX, Math.max(TEXT_SIZE_MIN, Math.round(value)));
}

function normalizeTextSize(value: StoredAccessibilitySettings["textSize"]) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampTextSize(value);
  }

  switch (value) {
    case "large":
      return 20;
    case "xl":
      return 24;
    case "normal":
    default:
      return 16;
  }
}

function normalizeAccessibilitySettings(
  value: Partial<StoredAccessibilitySettings> | null | undefined,
): AccessibilitySettings {
  return {
    language: value?.language === "es" ? "es" : "en",
    textSize: normalizeTextSize(value?.textSize),
    highContrast: Boolean(value?.highContrast),
    colorBlindMode:
      value?.colorBlindMode === "protanopia" ||
      value?.colorBlindMode === "deuteranopia" ||
      value?.colorBlindMode === "tritanopia"
        ? value.colorBlindMode
        : "none",
    reducedMotion: Boolean(value?.reducedMotion),
    screenReaderOptimized: Boolean(value?.screenReaderOptimized),
    voiceOutput: Boolean(value?.voiceOutput),
    voiceSpeed:
      typeof value?.voiceSpeed === "number" && Number.isFinite(value.voiceSpeed)
        ? Math.min(1.2, Math.max(0.7, value.voiceSpeed))
        : defaultAccessibilitySettings.voiceSpeed,
  };
}

function isStoredSettingsNormalized(
  current: Partial<StoredAccessibilitySettings> | null | undefined,
  next: AccessibilitySettings,
) {
  return (
    current?.language === next.language &&
    current?.textSize === next.textSize &&
    current?.highContrast === next.highContrast &&
    current?.colorBlindMode === next.colorBlindMode &&
    current?.reducedMotion === next.reducedMotion &&
    current?.screenReaderOptimized === next.screenReaderOptimized &&
    current?.voiceOutput === next.voiceOutput &&
    current?.voiceSpeed === next.voiceSpeed
  );
}

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
  const [storedSettings, setStoredSettings] = useLocalStorage<StoredAccessibilitySettings>(
    "arrivesafe-accessibility",
    defaultAccessibilitySettings,
  );
  const settings = useMemo(
    () => normalizeAccessibilitySettings(storedSettings),
    [storedSettings],
  );

  useEffect(() => {
    if (isStoredSettingsNormalized(storedSettings, settings)) {
      return;
    }

    setStoredSettings(settings);
  }, [settings, setStoredSettings, storedSettings]);

  const setSettings = useCallback<Dispatch<SetStateAction<AccessibilitySettings>>>(
    (nextValue) => {
      setStoredSettings((currentValue) => {
        const normalizedCurrent = normalizeAccessibilitySettings(currentValue);
        const resolvedValue =
          typeof nextValue === "function"
            ? nextValue(normalizedCurrent)
            : nextValue;

        return normalizeAccessibilitySettings(resolvedValue);
      });
    },
    [setStoredSettings],
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
