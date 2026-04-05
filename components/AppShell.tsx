"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Home,
  PhoneCall,
  ScanSearch,
  Settings2,
  Shield,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import { AccessibilityMenuButton } from "@/components/AccessibilityMenuButton";
import { BottomNav } from "@/components/BottomNav";
import { useDashboardAccess } from "@/hooks/useDashboardAccess";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { useViewMode } from "@/hooks/useViewMode";
import { canAccessRoute, isProtectedRoute } from "@/lib/dashboardAccess";
import type { StorySessionState } from "@/types/simulator";

const SIMULATOR_SESSION_KEY = "arrivesafe-simulator-session";

export function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const isLanding = pathname === "/";
  const isSimulator = pathname.startsWith("/simulate");
  const { resolvedMode, isReady } = useViewMode();
  const [storySession, , isStorySessionReady] = useLocalStorage<StorySessionState | null>(
    SIMULATOR_SESSION_KEY,
    null,
  );
  const [isDashboardBuilt, , accessReady] = useDashboardAccess();
  const routeAccessible = canAccessRoute(pathname, isDashboardBuilt);
  const shouldRedirectHome = accessReady && !routeAccessible;
  const waitingOnProtectedAccess = !accessReady && isProtectedRoute(pathname);
  const shouldRenderFallbackChildren = !waitingOnProtectedAccess && !shouldRedirectHome;
  const hasActiveSimulatorStory = isSimulator && Boolean(storySession?.scenarioId);
  const shouldUseWebsiteShell =
    (isSimulator && !hasActiveSimulatorStory) || (!isSimulator && resolvedMode === "website");

  const websiteNav = [
    { href: "/dashboard", label: t("dashboard"), icon: Home },
    { href: "/newcomer-guide", label: t("newcomerGuide"), icon: BookOpen },
    { href: "/simulate", label: t("shockSimulator"), icon: Sparkles },
    { href: "/coverage", label: t("coverage"), icon: Shield },
    { href: "/decode", label: t("policyDecoder"), icon: ScanSearch },
    { href: "/claim", label: t("claimCoach"), icon: PhoneCall },
  ];
  const shellNav = accessReady && isDashboardBuilt
    ? [{ href: "/", label: t("websiteOverview") }, ...websiteNav]
    : [{ href: "/", label: t("websiteOverview") }];

  useEffect(() => {
    if (!shouldRedirectHome) {
      return;
    }

    router.replace("/");
  }, [router, shouldRedirectHome]);

  if (!isReady || !isStorySessionReady || waitingOnProtectedAccess || shouldRedirectHome) {
    return (
      <>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black"
        >
          {t("skipToContent")}
        </a>
        <div className="min-h-dvh bg-[var(--color-background)]">
          <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {shouldRenderFallbackChildren ? children : null}
          </main>
          <AccessibilityMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </div>
      </>
    );
  }

  if (shouldUseWebsiteShell) {
    return (
      <>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black"
        >
          {t("skipToContent")}
        </a>
        <div className="website-shell min-h-dvh">
          <header className="sticky top-0 z-40">
            <div className="website-topbar">
              <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm sm:px-6 lg:px-8">
                <Link href="/" className="font-display text-3xl leading-none text-white">
                  FirstCover
                </Link>
                <div className="flex flex-wrap items-center justify-end gap-2 lg:gap-3">
                  <LanguageToggle tone="light" className="website-topbar-toggle" />
                  <ViewModeToggle tone="light" compact className="website-topbar-toggle" />
                  <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    aria-label={t("accessibility")}
                    className="website-topbar-action"
                  >
                    <Settings2 className="size-4" />
                    <span>{t("accessibility")}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="website-header backdrop-blur-xl">
              <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                <div className="min-w-0">
                  <p className="web-kicker">{t("appName")}</p>
                  <p className="mt-2 max-w-[56ch] text-sm leading-6 text-[var(--color-muted)]">
                    {t("tagline")}
                  </p>
                </div>

                <nav aria-label="Main navigation" className="mt-5 flex flex-wrap gap-2">
                  {shellNav.map((item) => {
                    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                    const Icon = "icon" in item ? item.icon : null;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`website-navlink whitespace-nowrap ${
                          active ? "website-navlink-active" : ""
                        }`}
                      >
                        {Icon ? <Icon className="size-4" /> : null}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </header>

          <main
            id="main-content"
            className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
          >
            {children}
          </main>
          <footer className="website-footer-band">
            <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
              <div>
                <p className="web-kicker">{t("websiteOverview")}</p>
                <p className="mt-2 max-w-[56ch] text-base leading-7 text-[var(--color-muted)]">
                  {t("homePitchCopy")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/" className="web-primary-button">
                  {t("getStarted")}
                </Link>
                {accessReady && isDashboardBuilt ? (
                  <Link href="/dashboard" className="web-secondary-button">
                    {t("dashboard")}
                  </Link>
                ) : null}
              </div>
            </div>
          </footer>
          <AccessibilityMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </div>
      </>
    );
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black"
      >
        {t("skipToContent")}
      </a>
      <div className="pointer-events-none fixed inset-x-0 top-3 z-40 flex justify-center px-4">
        <ViewModeToggle tone="dark" compact className="pointer-events-auto shadow-[0_14px_40px_rgba(0,0,0,0.25)]" />
      </div>

      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[var(--color-background)]">
        <main
          id="main-content"
          className={`relative flex-1 ${
            isSimulator
              ? "overflow-hidden px-0 pb-0"
              : isLanding
                ? "px-4 pb-12 pt-20"
                : "px-4 pb-28 pt-20"
          }`}
        >
          {children}
        </main>
        {!isLanding && !isSimulator && accessReady && isDashboardBuilt ? <BottomNav /> : null}
        <AccessibilityMenuButton
          onClick={() => setMenuOpen(true)}
          className={isSimulator ? "right-3 top-16 bottom-auto min-h-12 min-w-12" : ""}
        />
        <AccessibilityMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </>
  );
}
