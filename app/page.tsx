import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Sparkles, Volume2 } from "lucide-react";

import { LanguageToggle } from "@/components/LanguageToggle";

export default function Home() {
  return (
    <div className="py-6 lg:py-10">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="hero-grid panel-card hero-ambient overflow-hidden bg-[rgb(8_10_18_/_0.9)] text-white">
          <div className="flex items-start justify-between gap-3">
            <p className="eyebrow text-white/65">Insurance onboarding + policy decoder</p>
            <div className="lg:hidden">
              <LanguageToggle />
            </div>
          </div>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-6xl lg:max-w-[8ch] lg:text-7xl">
            ArriveSafe
          </h1>
          <p className="mt-4 max-w-[34ch] text-base text-white/76 lg:text-lg">
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

          <div className="mt-8 grid gap-3 md:grid-cols-3 lg:grid-cols-1">
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
        </div>

        <div className="grid gap-6">
          <section className="panel-card bg-[linear-gradient(180deg,rgba(212,96,58,0.1),rgba(255,255,255,0.8))]">
            <p className="eyebrow">Why now</p>
            <h2 className="font-display text-3xl text-[var(--color-ink)]">
              Most newcomers learn the rules after the expensive mistake.
            </h2>
            <p className="mt-4 text-base text-[var(--color-muted)]">
              ArriveSafe turns that invisible risk into a clear first-month plan for driving,
              renting, policy choices, and claim response.
            </p>
          </section>

          <section className="panel-card">
            <p className="eyebrow">Inside the toolkit</p>
            <div className="mt-5 grid gap-3">
              {[
                {
                  title: "Shock simulator",
                  copy: "See the financial gap between staying exposed and getting covered.",
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
      </section>

      <section className="panel-card mt-6">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="eyebrow">The pitch</p>
            <h2 className="font-display text-3xl text-[var(--color-ink)]">
              44 million immigrants in America. Most never get a plain-language insurance walkthrough.
            </h2>
          </div>
          <p className="text-base text-[var(--color-muted)]">
            ArriveSafe is a field guide for the first two years in the US: onboarding, shock
            scenarios, policy decoding, claim coaching, affordability checks, and scam detection.
          </p>
        </div>
      </section>
    </div>
  );
}
