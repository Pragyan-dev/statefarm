"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import { AccessibilityMenuButton } from "@/components/AccessibilityMenuButton";
import { BottomNav } from "@/components/BottomNav";

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

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[var(--color-background)]">
        <main
          id="main-content"
          className={`relative flex-1 ${
            isSimulator ? "overflow-hidden px-0 pb-0" : isLanding ? "px-4 pb-12" : "px-4 pb-28"
          }`}
        >
          {children}
        </main>
        {!isLanding && !isSimulator ? <BottomNav /> : null}
        <AccessibilityMenuButton
          onClick={() => setMenuOpen(true)}
          className={isSimulator ? "right-3 top-3 bottom-auto min-h-12 min-w-12" : ""}
        />
        <AccessibilityMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </>
  );
}
