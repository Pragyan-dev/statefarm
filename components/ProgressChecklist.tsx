"use client";

import { CheckCircle2 } from "lucide-react";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { UserProfile } from "@/lib/types";

export interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
}

export function ProgressChecklist({
  items,
  profile,
  onProfileChange,
}: {
  items: ChecklistItem[];
  profile: UserProfile;
  onProfileChange: (next: UserProfile) => void;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";

  function toggleItem(id: string) {
    const nextChecklist = profile.checklist.includes(id)
      ? profile.checklist.filter((item) => item !== id)
      : [...profile.checklist, id];

    onProfileChange({
      ...profile,
      checklist: nextChecklist,
    });
  }

  return (
    <section className="panel-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">{isSpanish ? "Plan de 30 dias" : "30-day plan"}</p>
          <h2 className="font-display text-2xl text-[var(--color-ink)]">
            {isSpanish ? "Lista de progreso" : "Progress checklist"}
          </h2>
        </div>
        <div
          role="progressbar"
          aria-valuenow={Math.round((profile.checklist.length / items.length) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={
            isSpanish
              ? `Progreso de la guia ${Math.round((profile.checklist.length / items.length) * 100)} por ciento`
              : `Guide completion ${Math.round((profile.checklist.length / items.length) * 100)} percent`
          }
          className="rounded-full bg-[var(--color-paper)] px-3 py-2 text-sm font-semibold text-[var(--color-ink)]"
        >
          {profile.checklist.length}/{items.length}
        </div>
      </div>

      <ul className="mt-5 grid gap-3" role="list">
        {items.map((item) => {
          const checked = profile.checklist.includes(item.id);
          return (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleItem(item.id)}
                  aria-label={item.label}
                  className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {checked ? <CheckCircle2 className="size-4 text-[var(--color-success)]" /> : null}
                    <p className="font-semibold text-[var(--color-ink)]">{item.label}</p>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{item.detail}</p>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
