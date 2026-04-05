"use client";

import claimVideos from "@/data/claim-videos.json";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Settings2,
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
const SUPPORT_PHONE = claimVideos.statefarmLinks.phone;
const APP_IOS_URL = claimVideos.statefarmLinks.appIos;
const APP_ANDROID_URL = claimVideos.statefarmLinks.appAndroid;
const FILE_CLAIM_URL = claimVideos.statefarmLinks.fileClaim;

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
    { href: "/dashboard", label: t("dashboard") },
    { href: "/newcomer-guide", label: t("newcomerGuide") },
    { href: "/simulate", label: t("shockSimulator") },
    { href: "/coverage", label: t("coverage") },
    { href: "/decode", label: t("policyDecoder") },
    { href: "/claim", label: t("claimCoach") },
  ];
  const websiteUtilityNav = accessReady && isDashboardBuilt
    ? websiteNav
    : [{ href: "/intake", label: t("getStarted") }];

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
        <div className="sf-shell">
          <header className="sf-topbar sticky top-0 z-40">
            <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
              <div className="hidden lg:block">
                <div className="flex items-center justify-between gap-6 py-4">
                  <Link href="/" className="text-[1.8rem] font-extrabold leading-none text-white">
                    FirstCover
                  </Link>

                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <a href={`tel:${SUPPORT_PHONE}`} className="sf-topbar-utility">
                      {SUPPORT_PHONE}
                    </a>
                    <LanguageToggle tone="dark" />
                    <ViewModeToggle tone="dark" compact />
                    <button
                      type="button"
                      onClick={() => setMenuOpen(true)}
                      aria-label={t("accessibility")}
                      className="sf-topbar-utility"
                    >
                      <Settings2 className="size-4" />
                      <span className="hidden xl:inline">{t("accessibility")}</span>
                    </button>
                  </div>
                </div>

                <nav aria-label="Primary navigation" className="sf-topbar-nav">
                  {websiteUtilityNav.map((item) => {
                    const active = pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`sf-topbar-link ${active ? "underline underline-offset-8" : ""}`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="py-4 lg:hidden">
                <div className="flex items-center justify-between gap-3">
                  <Link href="/" className="text-[1.45rem] font-extrabold leading-none text-white">
                    FirstCover
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    aria-label={t("accessibility")}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 text-white"
                  >
                    <Settings2 className="size-4" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <LanguageToggle tone="dark" />
                  <ViewModeToggle tone="dark" compact />
                </div>

                <nav aria-label="Primary navigation" className="sf-topbar-mobile-nav mt-3 border-t border-white/15 pt-3">
                  {websiteUtilityNav.map((item) => {
                    const active = pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`sf-topbar-link whitespace-nowrap ${active ? "underline underline-offset-8" : ""}`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </header>

          <main id="main-content" className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
          <WebsiteFooter />
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
        <ViewModeToggle tone="dark" compact className="pointer-events-auto" />
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

function WebsiteFooter() {
  return (
    <footer className="sf-footer">
      <section className="sf-footer-disclosure">
        <div className="mx-auto max-w-[1280px] px-4 py-8 text-sm text-[var(--color-muted)] sm:px-6 lg:px-8">
          <p className="text-lg font-semibold text-[var(--color-ink)]">FirstCover disclosures</p>
          <p className="mt-3 max-w-[78ch] leading-7">
            FirstCover is a hackathon project designed to help users explore onboarding,
            coverage, policy decoding, and claim education flows. It is not a licensed insurance
            carrier, legal advisor, or claims adjuster.
          </p>
          <p className="mt-3 max-w-[78ch] leading-7">
            External claim, coverage, and mobile-app links may direct you to State Farm public
            resources for demonstration purposes. Always confirm final eligibility, pricing, and
            policy details with the insurer directly.
          </p>
        </div>
      </section>

      <section className="sf-footer-strip">
        <div className="mx-auto max-w-[1280px] px-4 py-4 text-base font-bold sm:px-6 lg:px-8">
          FirstCover is here when you need the next step.
        </div>
      </section>

      <section className="sf-footer-grid">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <p className="text-xl font-semibold text-[var(--color-ink)]">Legal information</p>
            <div className="mt-5 grid gap-3 text-sm text-[var(--color-muted)]">
              <Link href="/">Home</Link>
              <Link href="/intake">Get started</Link>
              <Link href="/newcomer-guide">Guide</Link>
              <a href={FILE_CLAIM_URL} target="_blank" rel="noreferrer">File a claim</a>
            </div>
          </div>

          <div>
            <p className="text-xl font-semibold text-[var(--color-ink)]">Download the insurance app</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={APP_IOS_URL} target="_blank" rel="noreferrer" className="sf-store-link">
                Download on the App Store
              </a>
              <a href={APP_ANDROID_URL} target="_blank" rel="noreferrer" className="sf-store-link">
                Get it on Google Play
              </a>
            </div>
          </div>

          <div>
            <p className="text-xl font-semibold text-[var(--color-ink)]">Need help right away?</p>
            <div className="mt-5 grid gap-3 text-sm text-[var(--color-muted)]">
              <a href={`tel:${SUPPORT_PHONE}`} className="font-semibold text-[var(--color-ink)]">
                Give claims a call: {SUPPORT_PHONE}
              </a>
              <a href={FILE_CLAIM_URL} target="_blank" rel="noreferrer">
                Open the claim center
              </a>
              <Link href="/claim">Use the claim coach</Link>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
