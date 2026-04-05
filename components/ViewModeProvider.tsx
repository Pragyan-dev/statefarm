"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import type { ViewMode } from "@/lib/types";

export const VIEW_MODE_STORAGE_KEY = "arrivesafe-view-mode";
const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

function isViewMode(value: string | null): value is ViewMode {
  return value === "website" || value === "app";
}

export const ViewModeContext = createContext<{
  explicitMode: ViewMode | null;
  resolvedMode: ViewMode;
  isReady: boolean;
  setMode: (mode: ViewMode) => void;
  clearMode: () => void;
  toggleMode: () => void;
} | null>(null);

export function ViewModeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [explicitMode, setExplicitMode] = useState<ViewMode | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

    const syncViewport = () => {
      setIsMobile(mediaQuery.matches);
    };

    const initialize = window.setTimeout(() => {
      syncViewport();
      const storedMode = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (isViewMode(storedMode)) {
        setExplicitMode(storedMode);
      }
      setIsReady(true);
    }, 0);

    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      window.clearTimeout(initialize);
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  const resolvedMode = explicitMode ?? (isMobile ? "app" : "website");

  const setMode = useCallback((mode: ViewMode) => {
    setExplicitMode(mode);
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  }, []);

  const clearMode = useCallback(() => {
    setExplicitMode(null);
    window.localStorage.removeItem(VIEW_MODE_STORAGE_KEY);
  }, []);

  const toggleMode = useCallback(() => {
    const nextMode = resolvedMode === "website" ? "app" : "website";
    setExplicitMode(nextMode);
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, nextMode);
  }, [resolvedMode]);

  const value = useMemo(
    () => ({
      explicitMode,
      resolvedMode,
      isReady,
      setMode,
      clearMode,
      toggleMode,
    }),
    [clearMode, explicitMode, isReady, resolvedMode, setMode, toggleMode],
  );

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}
