"use client";

import { PhoneCall, Smartphone, Globe } from "lucide-react";

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
            className="claim-quick-rise flex min-h-14 items-center justify-between rounded-[1.25rem] bg-[var(--color-ink)] px-4 py-3 text-left text-white shadow-[0_18px_34px_rgba(17,24,39,0.2)] transition active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              <PhoneCall className="size-5" />
              <span>
                <span className="block text-sm font-semibold">
                  {isSpanish ? "Llamar a State Farm — 24/7" : "Call State Farm — 24/7"}
                </span>
                <span className="block text-xs text-white/70">{phone}</span>
              </span>
            </span>
          </a>

          <a
            href={claimUrl}
            target="_blank"
            rel="noreferrer"
            className="claim-quick-rise flex min-h-14 items-center justify-between rounded-[1.25rem] border-2 border-[var(--color-ink)] bg-white px-4 py-3 text-left text-[var(--color-ink)] transition active:scale-[0.98]"
            style={{ animationDelay: "120ms" }}
          >
            <span className="flex items-center gap-3">
              <Globe className="size-5" />
              <span className="text-sm font-semibold">
                {isSpanish ? "Presentar reclamo en linea" : "File claim online"}
              </span>
            </span>
          </a>

          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            className="claim-quick-rise flex min-h-14 items-center justify-between rounded-[1.25rem] bg-[rgba(17,24,39,0.06)] px-4 py-3 text-left text-[var(--color-ink)] transition active:scale-[0.98]"
            style={{ animationDelay: "240ms" }}
          >
            <span className="flex items-center gap-3">
              <Smartphone className="size-5" />
              <span>
                <span className="block text-sm font-semibold">
                  {isSpanish ? "Abrir app de State Farm" : "Open State Farm app"}
                </span>
                <span className="block text-xs text-[var(--color-muted)]">
                  {isSpanish ? "Seguimiento y actualizaciones" : "Track and manage your claim"}
                </span>
              </span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
