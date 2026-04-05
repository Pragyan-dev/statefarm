"use client";

import f1Guide from "@/data/newcomer-guides/f1.json";
import h1bGuide from "@/data/newcomer-guides/h1b.json";
import j1Guide from "@/data/newcomer-guides/j1.json";
import o1Guide from "@/data/newcomer-guides/o1.json";

import { NewcomerGuide, type NewcomerGuideData } from "@/components/NewcomerGuide";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function NewcomerGuidePage() {
  const [profile, , isReady] = useUserProfile();
  const guides = [f1Guide, h1bGuide, j1Guide, o1Guide] as NewcomerGuideData[];

  if (!isReady) {
    return <div className="py-10 text-sm text-[var(--color-muted)]">Loading guide...</div>;
  }

  return (
    <div className="py-6 lg:py-10">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="panel-card hero-ambient overflow-hidden">
          <p className="eyebrow">Newcomer guide</p>
          <h1 className="font-display text-4xl text-[var(--color-ink)] lg:max-w-[11ch]">
            The first 30 days are paperwork and logistics. Keep them organized.
          </h1>
          <p className="mt-4 text-base text-[var(--color-muted)]">
            Start with your visa track, then jump across the tabs when you need to compare how the
            rules change.
          </p>
        </section>

        <NewcomerGuide guides={guides} activeVisa={profile.visaStatus} />
      </section>
    </div>
  );
}
