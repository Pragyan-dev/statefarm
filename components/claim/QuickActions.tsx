"use client";

import { ArrowRight, Globe, PhoneCall, Smartphone } from "lucide-react";

import { useAccessibility } from "@/hooks/useAccessibility";

export function QuickActions({
  phone,
  claimUrl,
  iosUrl,
  androidUrl,
  sticky = false,
}: {
  phone: string;
  claimUrl: string;
  iosUrl: string;
  androidUrl: string;
  sticky?: boolean;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const appUrl = /android/i.test(userAgent) ? androidUrl : iosUrl;

  return (
    <section className={`${sticky ? "sticky bottom-3 z-20" : ""}`}>
      <div className="panel-card">
        <p className="eyebrow">{isSpanish ? "Acciones rapidas" : "Quick actions"}</p>
        <div className="mt-4 grid gap-3">
          <a
            href={`tel:${phone.replace(/[^\d]/g, "")}`}
            className="claim-quick-rise flex min-h-[5.25rem] items-center justify-between rounded-[1.4rem] border border-[rgba(212,96,58,0.2)] bg-[linear-gradient(135deg,#d4603a_0%,#e67647_100%)] px-4 py-3 text-left text-[#fff8f1] shadow-[0_18px_34px_rgba(212,96,58,0.24)] transition active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/16 text-[#fff8f1] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                <PhoneCall className="size-5" />
              </span>
              <span>
                <span className="block text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white/72">
                  {isSpanish ? "Accion principal" : "Primary action"}
                </span>
                <span className="mt-1 block text-base font-semibold">
                  {isSpanish ? "Llamar a State Farm — 24/7" : "Call State Farm — 24/7"}
                </span>
                <span className="mt-0.5 block text-sm text-white/82">{phone}</span>
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-white/82" />
          </a>

          <a
            href={claimUrl}
            target="_blank"
            rel="noreferrer"
            className="claim-quick-rise flex min-h-[4.5rem] items-center justify-between rounded-[1.4rem] border-2 border-[var(--color-ink)] bg-white px-4 py-3 text-left text-[var(--color-ink)] shadow-[0_10px_20px_rgba(17,24,39,0.06)] transition active:scale-[0.98]"
            style={{ animationDelay: "120ms" }}
          >
            <span className="flex items-center gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[rgba(17,24,39,0.06)] text-[var(--color-ink)]">
                <Globe className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  {isSpanish ? "Presentar reclamo en linea" : "File claim online"}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                  {isSpanish ? "Formulario oficial de State Farm" : "Official State Farm claim form"}
                </span>
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-[var(--color-muted)]" />
          </a>

          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            className="claim-quick-rise flex min-h-[4.5rem] items-center justify-between rounded-[1.4rem] border border-[rgba(17,24,39,0.08)] bg-[rgba(17,24,39,0.05)] px-4 py-3 text-left text-[var(--color-ink)] shadow-[0_8px_18px_rgba(17,24,39,0.05)] transition active:scale-[0.98]"
            style={{ animationDelay: "240ms" }}
          >
            <span className="flex items-center gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-[var(--color-ink)]">
                <Smartphone className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  {isSpanish ? "Abrir app de State Farm" : "Open State Farm app"}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                  {isSpanish ? "Seguimiento y actualizaciones" : "Track and manage your claim"}
                </span>
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-[var(--color-muted)]" />
          </a>
        </div>
      </div>
    </section>
  );
}
