"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Settings2 } from "lucide-react";
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
  const shouldRedirectLandingToDashboard = accessReady && isDashboardBuilt && isLanding;
  const waitingOnProtectedAccess = !accessReady && isProtectedRoute(pathname);
  const shouldRenderFallbackChildren =
    !waitingOnProtectedAccess && !shouldRedirectHome && !shouldRedirectLandingToDashboard;
  const hasActiveSimulatorStory = isSimulator && Boolean(storySession?.scenarioId);
  const shouldUseWebsiteShell =
    (isSimulator && !hasActiveSimulatorStory) || (!isSimulator && resolvedMode === "website");
  const showWebsiteChrome = accessReady && isDashboardBuilt;
  const shouldUseFullBleedSimulatorShell = isSimulator && hasActiveSimulatorStory;
  const topbarRef = useRef<HTMLElement | null>(null);
  const [topbarHeight, setTopbarHeight] = useState(0);

  const websiteNav = [
    { href: "/dashboard", label: t("dashboard") },
    { href: "/newcomer-guide", label: t("newcomerGuide") },
    { href: "/simulate", label: t("shockSimulator") },
    { href: "/coverage", label: t("coverage") },
    { href: "/decode", label: t("policyDecoder") },
    { href: "/claim", label: t("claimCoach") },
  ];
  const shellNav = showWebsiteChrome ? websiteNav : [{ href: "/", label: t("websiteOverview") }];
  const footerTrustChips = [
    t("footerTrustLanguages"),
    t("footerTrustAccessibility"),
    t("footerTrustVoice"),
  ];

  useEffect(() => {
    if (!shouldRedirectHome && !shouldRedirectLandingToDashboard) {
      return;
    }

    router.replace(shouldRedirectLandingToDashboard ? "/dashboard" : "/");
  }, [router, shouldRedirectHome, shouldRedirectLandingToDashboard]);

  useEffect(() => {
    if (!shouldUseWebsiteShell || !topbarRef.current) {
      return;
    }

    const topbar = topbarRef.current;
    const updateHeight = () => {
      setTopbarHeight(Math.round(topbar.getBoundingClientRect().height));
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeight);

      return () => {
        window.removeEventListener("resize", updateHeight);
      };
    }

    const observer = new ResizeObserver(() => {
      updateHeight();
    });
    observer.observe(topbar);
    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [shouldUseWebsiteShell, showWebsiteChrome]);

  if (
    !isReady ||
    !isStorySessionReady ||
    waitingOnProtectedAccess ||
    shouldRedirectHome ||
    shouldRedirectLandingToDashboard
  ) {
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
    const websiteShellStyle = {
      "--website-topbar-height": `${topbarHeight}px`,
    } as CSSProperties;

    return (
      <>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black"
        >
          {t("skipToContent")}
        </a>
        <div className="website-shell min-h-dvh" style={websiteShellStyle}>
          <div className="website-shell-frame">
            <header ref={topbarRef} className="website-topbar z-40">
              <div className="website-topbar-inner mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="website-topbar-row">
                  <Link
                    href={showWebsiteChrome ? "/dashboard" : "/"}
                    className="website-topbar-brand font-display text-white"
                  >
                    FirstCover
                  </Link>
                  <div className="website-topbar-controls">
                    <a href="tel:8007325246" className="website-topbar-pill">
                      <span>800-732-5246</span>
                    </a>
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
                <div className="website-topbar-divider" aria-hidden="true" />

                {showWebsiteChrome ? (
                  <nav aria-label="Main navigation" className="website-topbar-nav">
                    {shellNav.map((item) => {
                      const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`website-navlink whitespace-nowrap ${
                            active ? "website-navlink-active" : ""
                          }`}
                        >
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                ) : null}
              </div>
            </header>

            <main
              id="main-content"
              className={`website-main mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${
                showWebsiteChrome ? "py-8 lg:py-10" : "py-4 lg:py-5"
              }`}
            >
              {children}
            </main>
          </div>
          {showWebsiteChrome ? (
            <footer className="website-footer-band">
              <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="website-footer-grid">
                  <section className="website-footer-column">
                    <p className="web-kicker">{t("footerSupportEyebrow")}</p>
                    <h2 className="mt-3 font-display text-3xl leading-tight text-[var(--color-ink)]">
                      FirstCover
                    </h2>
                    <p className="website-footer-support-copy mt-3">
                      {t("footerSupportCopy")}
                    </p>
                    <div className="website-footer-chip-row mt-5">
                      {footerTrustChips.map((chip) => (
                        <span key={chip} className="website-footer-chip">
                          {chip}
                        </span>
                      ))}
                    </div>
                  </section>

                  <nav className="website-footer-column" aria-label={t("footerExploreEyebrow")}>
                    <p className="web-kicker">{t("footerExploreEyebrow")}</p>
                    <div className="website-footer-link-list mt-4">
                      {websiteNav.map((item) => (
                        <Link key={item.href} href={item.href} className="website-footer-link">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </nav>

                  <section className="website-footer-column website-footer-help">
                    <p className="web-kicker">{t("footerHelpEyebrow")}</p>
                    <p className="mt-3 text-lg font-semibold leading-7 text-[var(--color-ink)]">
                      {t("footerHelpTitle")}
                    </p>
                    <p className="website-footer-help-copy mt-3">
                      {t("footerHelpCopy")}
                    </p>
                    <a href="tel:8007325246" className="website-footer-phone mt-5">
                      <span>{t("footerCallLabel")}</span>
                      <span>800-732-5246</span>
                    </a>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link href="/dashboard" className="web-primary-button">
                        {t("dashboard")}
                      </Link>
                      <Link href="/claim" className="web-secondary-button">
                        {t("claimCoach")}
                      </Link>
                    </div>
                  </section>
                </div>

                <div className="website-footer-meta mt-8">
                  <p className="website-footer-disclaimer">{t("footerDisclaimer")}</p>
                  <div className="website-footer-utility-list">
                    <span>{t("language")}</span>
                    <span>{t("accessibility")}</span>
                  </div>
                </div>
              </div>
            </footer>
          ) : null}
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

      <div
        className={`flex min-h-dvh w-full flex-col bg-[var(--color-background)] ${
          shouldUseFullBleedSimulatorShell ? "" : "mx-auto max-w-[430px]"
        }`}
      >
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
