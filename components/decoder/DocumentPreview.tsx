"use client";

import Image from "next/image";

export function DocumentPreview({
  src,
  kind,
  name,
  dimmed = false,
  className = "",
}: {
  src: string;
  kind: "image" | "pdf";
  name: string;
  dimmed?: boolean;
  className?: string;
}) {
  if (kind === "image") {
    return (
      <div
        className={`relative overflow-hidden rounded-[1.6rem] border border-[rgba(17,24,39,0.1)] bg-white shadow-[0_18px_38px_rgba(17,24,39,0.12)] ${className}`}
      >
        <Image
          src={src}
          alt={name}
          fill
          unoptimized
          sizes="(max-width: 430px) 280px, 320px"
          className={`object-cover transition-opacity duration-500 ${
            dimmed ? "opacity-35" : "opacity-100"
          }`}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[1.6rem] border border-[rgba(17,24,39,0.1)] bg-[#fbf6ef] shadow-[0_18px_38px_rgba(17,24,39,0.12)] ${className}`}
    >
      <PdfFallback name={name} dimmed={dimmed} />
    </div>
  );
}

function PdfFallback({
  name,
  dimmed,
}: {
  name: string;
  dimmed: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 rounded-[1.6rem] bg-[rgba(251,246,239,0.98)] px-5 py-5 transition-opacity duration-500 ${
        dimmed ? "opacity-35" : "opacity-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[var(--color-muted)]">
            Policy PDF
          </p>
          <p className="mt-2 font-display text-2xl text-[var(--color-ink)]">SafeHome Insurance</p>
        </div>
        <div className="rounded-full border border-[var(--color-border)] bg-[rgba(17,24,39,0.04)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
          PDF
        </div>
      </div>

      <div className="mt-6 grid gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`${name}-${index}`}
            className="rounded-full bg-[rgba(17,24,39,0.08)]"
            style={{
              height: index === 0 ? "0.95rem" : "0.55rem",
              width: `${index % 3 === 0 ? 92 : index % 2 === 0 ? 78 : 64}%`,
            }}
          />
        ))}
      </div>

      <div className="mt-7 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">Document</p>
          <p className="mt-2 max-w-[14ch] text-sm font-semibold text-[var(--color-ink)]">{name}</p>
        </div>
        <div className="rounded-[1rem] bg-[rgba(212,96,58,0.12)] px-3 py-2 text-xs font-semibold text-[var(--color-accent)]">
          Coverage scan ready
        </div>
      </div>
    </div>
  );
}
