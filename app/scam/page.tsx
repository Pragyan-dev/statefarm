"use client";

import { useState } from "react";

import { ReadAloud } from "@/components/ReadAloud";
import { useAccessibility } from "@/hooks/useAccessibility";
import type { ScamVerdictResult } from "@/lib/types";

const verdictClasses: Record<ScamVerdictResult["verdict"], string> = {
  SCAM: "border-[var(--color-danger)] bg-[rgba(182,70,59,0.1)]",
  PREDATORY: "border-[var(--color-warning)] bg-[rgba(213,136,27,0.1)]",
  WARNING: "border-[var(--color-warning)] bg-[rgba(213,136,27,0.08)]",
  SAFE: "border-[var(--color-success)] bg-[rgba(31,122,90,0.08)]",
};

export default function ScamPage() {
  const { settings } = useAccessibility();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamVerdictResult | null>(null);

  async function handleSubmit() {
    setLoading(true);
    try {
      const response = await fetch("/api/scam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: value,
          language: settings.language,
        }),
      });
      const payload = (await response.json()) as ScamVerdictResult;
      setResult(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-6 lg:py-10">
      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-6">
          <section className="panel-card hero-ambient overflow-hidden">
            <p className="eyebrow">Scam checker</p>
            <h1 className="font-display text-4xl text-[var(--color-ink)] lg:max-w-[11ch]">
              Pressure tactics are easier to see when someone else names them.
            </h1>
            <p className="mt-4 text-base text-[var(--color-muted)]">
              Paste the offer, message, or script. We will look for scam patterns and predatory terms.
            </p>
          </section>

          <section className="panel-card">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                Paste the offer or describe what happened
              </span>
              <textarea
                value={value}
                onChange={(event) => setValue(event.target.value)}
                rows={6}
                className="w-full rounded-[1.5rem] border border-[var(--color-border)] bg-transparent px-4 py-3 text-[var(--color-ink)]"
                placeholder="They said I need immigration insurance and asked for a wire transfer today."
              />
            </label>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!value || loading}
              className="mt-4 min-h-12 w-full rounded-full bg-[var(--color-ink)] text-sm font-semibold text-[var(--color-paper)] disabled:opacity-50"
            >
              {loading ? "Checking..." : "Check this offer"}
            </button>
          </section>
        </div>

        <div className="grid gap-6">
          {result ? (
            <section className={`panel-card border ${verdictClasses[result.verdict]}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Verdict</p>
                  <h2 className="font-display text-3xl text-[var(--color-ink)]">{result.verdict}</h2>
                </div>
                <ReadAloud text={result.explanation} />
              </div>
              <p className="mt-4 text-base text-[var(--color-ink)]">{result.explanation}</p>
              <ul className="mt-4 grid gap-2 text-sm text-[var(--color-muted)]">
                {result.reasons.map((reason) => (
                  <li key={reason} className="pattern-chip rounded-[1rem] px-3 py-3">
                    {reason}
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section className="panel-card flex min-h-[320px] items-center justify-center text-center">
              <div className="max-w-[28ch]">
                <p className="eyebrow">Verdict</p>
                <h2 className="font-display text-3xl text-[var(--color-ink)]">
                  The result shows up here with a clear label and reasons.
                </h2>
                <p className="mt-4 text-sm text-[var(--color-muted)]">
                  SCAM, PREDATORY, WARNING, or SAFE. The explanation stays visible next to your
                  original text on larger screens.
                </p>
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
