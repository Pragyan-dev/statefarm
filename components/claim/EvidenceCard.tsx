"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera, Check } from "lucide-react";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { EvidenceItem } from "@/types/claim";

export function EvidenceCard({
  item,
  imageUrl,
  onCapture,
}: {
  item: EvidenceItem;
  imageUrl?: string;
  onCapture: (itemId: string, file: File) => void;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const Icon = item.icon;
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="w-[12.5rem] shrink-0 space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`relative flex h-[8.75rem] w-full overflow-hidden rounded-[1.25rem] border transition ${
          imageUrl
            ? "border-[rgba(31,122,90,0.24)] bg-white shadow-[0_14px_28px_rgba(17,24,39,0.08)]"
            : "border-dashed border-[rgba(17,24,39,0.18)] bg-white/60 hover:-translate-y-0.5"
        }`}
      >
        {imageUrl ? (
          <>
            <Image src={imageUrl} alt={item.label} fill unoptimized className="object-cover" />
            <span className="claim-evidence-check absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-[var(--color-success)] text-white shadow-[0_10px_18px_rgba(31,122,90,0.24)]">
              <Check className="size-4" />
            </span>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-[rgba(17,24,39,0.06)] text-[var(--color-ink)]">
              <Icon className="size-5" strokeWidth={1.9} />
            </span>
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-[rgba(17,24,39,0.08)] text-[var(--color-ink)]">
              <Camera className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">{item.label}</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">{item.description}</p>
            </div>
          </div>
        )}
      </button>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[var(--color-ink)]">{item.label}</p>
          {item.required ? (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-red-700">
              {isSpanish ? "Obligatorio" : "Required"}
            </span>
          ) : null}
        </div>
        <p className="text-xs leading-relaxed text-[var(--color-muted)]">{item.tips}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onCapture(item.id, file);
          }

          event.currentTarget.value = "";
        }}
      />
    </div>
  );
}
