"use client";

import f1Guide from "@/data/visa-guides/f1.json";
import h1bGuide from "@/data/visa-guides/h1b.json";
import j1Guide from "@/data/visa-guides/j1.json";
import o1Guide from "@/data/visa-guides/o1.json";

import { VisaGuide, type VisaGuideData } from "@/components/VisaGuide";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function GuidePage() {
  const [profile, , isReady] = useUserProfile();
  const guides = [f1Guide, h1bGuide, j1Guide, o1Guide] as VisaGuideData[];

  if (!isReady) {
    return <div className="py-10 text-sm text-[var(--color-muted)]">Loading guide...</div>;
  }

  return (
    <div className="py-6 lg:py-10">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="panel-card hero-ambient overflow-hidden">
          <p className="eyebrow">Visa guide</p>
          <h1 className="font-display text-4xl text-[var(--color-ink)] lg:max-w-[11ch]">
            The first 30 days are paperwork and logistics. Keep them organized.
          </h1>
          <p className="mt-4 text-base text-[var(--color-muted)]">
            Start with your visa track, then jump across the tabs when you need to compare how the
            rules change.
          </p>
        </section>

        <VisaGuide guides={guides} activeVisa={profile.visaStatus} />
      </section>
    </div>
  );
}
