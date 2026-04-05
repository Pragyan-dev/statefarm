"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, PhoneCall, ScanSearch, Shield, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations();

  const items = [
    {
      href: "/dashboard",
      label: t("dashboard"),
      icon: Home,
    },
    {
      href: "/newcomer-guide",
      label: t("newcomerGuide"),
      icon: BookOpen,
    },
    {
      href: "/simulate",
      label: t("shockSimulator"),
      icon: Sparkles,
    },
    {
      href: "/coverage",
      label: t("coverage"),
      icon: Shield,
    },
    {
      href: "/decode",
      label: t("policyDecoder"),
      icon: ScanSearch,
    },
    {
      href: "/claim",
      label: t("claimCoach"),
      icon: PhoneCall,
    },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-[var(--color-border)] bg-white/96 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-xl"
    >
      <ul className="grid grid-cols-6 gap-2">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium ${
                  active
                    ? "bg-[var(--color-accent)] text-white shadow-[0_10px_24px_var(--color-accent-glow)]"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-subtle)] hover:text-[var(--color-ink)]"
                }`}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
