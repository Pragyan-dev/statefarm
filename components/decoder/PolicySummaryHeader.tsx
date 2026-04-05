"use client";

import type { ReactNode } from "react";
import { CalendarDays, CreditCard, ShieldCheck } from "lucide-react";

import { AiSourceNotice } from "@/components/AiSourceNotice";
import { formatCurrency, formatDate } from "@/lib/content";
import { useAccessibility } from "@/hooks/useAccessibility";
import type { DecoderAnalysisResponse } from "@/types/policy";

export function PolicySummaryHeader({
  analysis,
}: {
  analysis: DecoderAnalysisResponse;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const status = getExpirationStatus(analysis.expirationDate);
  const providerInitials = analysis.provider
    .split(/\s+/)
    .slice(0, 2)
    .map((token) => token.charAt(0).toUpperCase())
    .join("");

  return (
    <section className="panel-card mx-auto w-full max-w-[36rem]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-14 items-center justify-center rounded-[1.25rem] bg-[rgba(212,96,58,0.14)] font-semibold text-[var(--color-ink)] shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)]">
            {providerInitials || "PI"}
          </div>
          <div>
            <p className="eyebrow">{isSpanish ? "Resumen rapido" : "Quick summary"}</p>
            <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">{analysis.provider}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {analysis.policyType}
              </span>
              {analysis.policyNumber ? (
                <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                  {analysis.policyNumber}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <ShieldCheck className="size-6 text-[var(--color-accent)]" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoChip
          icon={<CalendarDays className="size-4" />}
          label={isSpanish ? "Vence" : "Expires"}
          value={
            analysis.expirationDate
              ? formatDate(analysis.expirationDate, settings.language)
              : isSpanish
                ? "No visible"
                : "Not visible"
          }
        />
        <InfoChip
          icon={<CreditCard className="size-4" />}
          label={isSpanish ? "Pago mensual" : "Monthly cost"}
          value={
            typeof analysis.monthlyCost === "number"
              ? formatCurrency(analysis.monthlyCost, settings.language)
              : isSpanish
                ? "No visible"
                : "Not visible"
          }
        />
        <InfoChip
          icon={<ShieldCheck className="size-4" />}
          label={isSpanish ? "Tipo de poliza" : "Policy type"}
          value={analysis.policyType}
        />
      </div>

      {status ? (
        <div
          className="mt-4 rounded-[1.2rem] px-4 py-3 text-sm font-semibold"
          style={{
            background:
              status === "expired" ? "rgba(226,75,74,0.1)" : "rgba(239,159,39,0.12)",
            color: status === "expired" ? "#9B2E2E" : "#9A5A07",
          }}
        >
          {status === "expired"
            ? isSpanish
              ? "Esta poliza ya vencio."
              : "This policy has expired."
            : isSpanish
              ? "La poliza vence pronto."
              : "This policy expires soon."}
        </div>
      ) : null}

      <div className="mt-4">
        <AiSourceNotice aiSource={analysis.aiSource} fallbackReason={analysis.fallbackReason} />
      </div>
    </section>
  );
}

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.66)] px-4 py-4">
      <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-3 font-semibold text-[var(--color-ink)]">{value}</p>
    </div>
  );
}

function getExpirationStatus(expirationDate?: string) {
  if (!expirationDate) {
    return null;
  }

  const expiration = new Date(expirationDate);
  if (Number.isNaN(expiration.getTime())) {
    return null;
  }

  const now = new Date();
  const diffDays = Math.ceil((expiration.getTime() - now.getTime()) / 86_400_000);

  if (diffDays < 0) {
    return "expired";
  }

  if (diffDays <= 30) {
    return "soon";
  }

  return null;
}
