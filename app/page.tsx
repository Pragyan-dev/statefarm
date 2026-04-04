import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Sparkles, Volume2 } from "lucide-react";

import { LanguageToggle } from "@/components/LanguageToggle";

export default function Home() {
  return (
    <div className="py-6">
      <section className="hero-grid panel-card hero-ambient overflow-hidden bg-[rgb(8_10_18_/_0.9)] text-white">
        <div className="flex items-start justify-between gap-3">
          <p className="eyebrow text-white/65">Insurance onboarding + policy decoder</p>
          <LanguageToggle />
        </div>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-6xl">
          ArriveSafe
        </h1>
        <p className="mt-4 max-w-[28ch] text-base text-white/76">
          We show what happens if you stay uninsured, then walk you into real protection in the
          first 30 days.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/intake"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 text-sm font-semibold text-white"
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
          <div className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-white/80">
            <Volume2 className="size-4" />
            EN / ES voice guidance
          </div>
        </div>

        <div className="mt-8 grid gap-3">
          {[
            "Auto insurance without an SSN in many states",
            "Policy photos translated into plain language",
            "Claim coaching with voice input and State Farm links",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm text-white/76">
              <CheckCircle2 className="size-4 text-[var(--color-highlight)]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <p className="eyebrow">The pitch</p>
        <h2 className="font-display text-3xl text-[var(--color-ink)]">
          44 million immigrants in America. Most never get a plain-language insurance walkthrough.
        </h2>
        <p className="mt-4 text-base text-[var(--color-muted)]">
          ArriveSafe is a mobile-first field guide for the first two years in the US: onboarding,
          shock scenarios, policy decoding, claim coaching, and scam checking.
        </p>
      </section>

      <section className="panel-card">
        <p className="eyebrow">Inside the app</p>
        <div className="mt-5 grid gap-3">
          {[
            {
              title: "Shock simulator",
              copy: "Use patterned cost bars to make the penalty of waiting visible.",
              icon: Sparkles,
            },
            {
              title: "Coverage finder",
              copy: "Match ZIP code, state rules, and renter's estimates in one place.",
              icon: Shield,
            },
            {
              title: "Claim coach",
              copy: "Speak an incident out loud and get the step-by-step response plan.",
              icon: ArrowRight,
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-[1.75rem] border border-[var(--color-border)] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[var(--color-ink)]">{feature.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">{feature.copy}</p>
                  </div>
                  <Icon className="size-5 text-[var(--color-accent)]" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
