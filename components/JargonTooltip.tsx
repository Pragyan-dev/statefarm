"use client";

import { useId, useState } from "react";

import { useAccessibility } from "@/hooks/useAccessibility";

export function JargonTooltip({
  term,
  definition,
}: {
  term: string;
  definition: {
    en: string;
    es: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const { settings } = useAccessibility();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((current) => !current)}
        className="rounded-full bg-[var(--color-highlight)] px-2 py-1 text-xs font-semibold text-[var(--color-ink)]"
      >
        {term}
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-10 w-56 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-ink)] shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
        >
          {definition[settings.language]}
        </span>
      ) : null}
    </span>
  );
}
