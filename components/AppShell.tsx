"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
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
import { LanguageToggle } from "@/components/LanguageToggle";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { useViewMode } from "@/hooks/useViewMode";

export function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();
  const isLanding = pathname === "/";
  const isSimulator = pathname.startsWith("/simulate");
  const { resolvedMode, isReady } = useViewMode();

  const websiteNav = [
    { href: "/dashboard", label: t("dashboard"), icon: Home },
    { href: "/newcomer-guide", label: t("newcomerGuide"), icon: BookOpen },
    { href: "/simulate", label: t("shockSimulator"), icon: Sparkles },
    { href: "/coverage", label: t("coverage"), icon: Shield },
    { href: "/decode", label: t("policyDecoder"), icon: ScanSearch },
    { href: "/claim", label: t("claimCoach"), icon: PhoneCall },
  ];

  if (!isReady) {
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
            {children}
          </main>
          <AccessibilityMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </div>
      </>
    );
  }

  if (resolvedMode === "website") {
    return (
      <>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black"
        >
          {t("skipToContent")}
        </a>
        <div className="min-h-dvh bg-[var(--color-background)]">
          <header className="sticky top-0 z-40 border-b border-[var(--color-accent-wash)] bg-[linear-gradient(180deg,rgba(255,251,250,0.96),rgba(251,246,239,0.9))] backdrop-blur-xl">
            <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <Link href="/" className="font-display text-3xl leading-none text-[var(--color-ink)]">
                    ArriveSafe
                  </Link>
                  <p className="mt-1 max-w-[46ch] text-sm text-[var(--color-muted)]">
                    {t("tagline")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <LanguageToggle tone="light" />
                  <ViewModeToggle tone="light" compact />
                  <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    aria-label={t("accessibility")}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] shadow-sm transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    <Settings2 className="size-4" />
                    <span className="hidden sm:inline">{t("accessibility")}</span>
                  </button>
                </div>
              </div>

              <nav
                aria-label="Main navigation"
                className="mt-4 flex gap-2 overflow-x-auto pb-1"
              >
                {websiteNav.map((item) => {
                  const active = pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                        active
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-paper)]"
                          : "border-[var(--color-border)] bg-white/60 text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:bg-white hover:text-[var(--color-accent)]"
                      }`}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>

          <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            {children}
          </main>
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
        {!isLanding && !isSimulator ? <BottomNav /> : null}
        <AccessibilityMenuButton
          onClick={() => setMenuOpen(true)}
          className={isSimulator ? "right-3 top-16 bottom-auto min-h-12 min-w-12" : ""}
        />
        <AccessibilityMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </>
  );
}
