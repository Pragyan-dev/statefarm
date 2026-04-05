"use client";

import { NextIntlClientProvider } from "next-intl";
import { useEffect } from "react";

import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import { DashboardAccessProvider } from "@/components/DashboardAccessProvider";
import { ViewModeProvider } from "@/components/ViewModeProvider";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useViewMode } from "@/hooks/useViewMode";
import enMessages from "@/messages/en.json";
import esMessages from "@/messages/es.json";

function AppClassBridge({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { settings } = useAccessibility();
  const { resolvedMode, isReady } = useViewMode();

  useEffect(() => {
    const root = document.documentElement;
    root.lang = settings.language;
    root.dataset.viewMode = isReady ? resolvedMode : "website";
    root.classList.remove(
      "text-size-normal",
      "text-size-large",
      "text-size-xl",
      "high-contrast",
      "cb-protanopia",
      "cb-deuteranopia",
      "cb-tritanopia",
      "reduced-motion",
      "screen-reader-optimized",
    );

    root.classList.add(`text-size-${settings.textSize}`);

    if (settings.highContrast) {
      root.classList.add("high-contrast");
    }

    if (settings.colorBlindMode !== "none") {
      root.classList.add(`cb-${settings.colorBlindMode}`);
    }

    if (settings.reducedMotion) {
      root.classList.add("reduced-motion");
    }

    if (settings.screenReaderOptimized) {
      root.classList.add("screen-reader-optimized");
    }
  }, [isReady, resolvedMode, settings]);

  return (
    <NextIntlClientProvider
      locale={settings.language}
      messages={settings.language === "es" ? esMessages : enMessages}
      now={new Date()}
      timeZone="America/Phoenix"
    >
      {children}
      <svg className="sr-only" aria-hidden="true">
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"
            />
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"
            />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"
            />
          </filter>
        </defs>
      </svg>
    </NextIntlClientProvider>
  );
}

export function AppProviders({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewModeProvider>
      <DashboardAccessProvider>
        <AccessibilityProvider>
          <AppClassBridge>{children}</AppClassBridge>
        </AccessibilityProvider>
      </DashboardAccessProvider>
    </ViewModeProvider>
  );
}
