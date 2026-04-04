"use client";

import { Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function AccessibilityMenuButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const t = useTranslations();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("accessibility")}
      className="fixed bottom-24 right-4 z-40 flex min-h-14 min-w-14 items-center justify-center rounded-full border border-white/20 bg-[var(--color-accent)] text-[var(--color-paper)] shadow-[0_16px_30px_rgba(0,0,0,0.3)]"
    >
      <Settings2 className="size-5" />
    </button>
  );
}
