"use client";

import { useState } from "react";

import { useAccessibility } from "@/hooks/useAccessibility";
import f1Guide from "@/data/newcomer-guides/f1.json";
import h1bGuide from "@/data/newcomer-guides/h1b.json";
import j1Guide from "@/data/newcomer-guides/j1.json";
import o1Guide from "@/data/newcomer-guides/o1.json";

import { NewcomerGuide, type NewcomerGuideData } from "@/components/NewcomerGuide";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { VisaType } from "@/lib/types";

export default function NewcomerGuidePage() {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const [profile, setProfile, isReady] = useUserProfile();
  const [selectedVisaOverride, setSelectedVisaOverride] = useState<VisaType | null>(null);
  const guides = [f1Guide, h1bGuide, j1Guide, o1Guide] as NewcomerGuideData[];
  const selectedVisa = selectedVisaOverride ?? profile.visaStatus;

  function toggleGuideTask(taskId: string) {
    setProfile((current) => ({
      ...current,
      checklist: current.checklist.includes(taskId)
        ? current.checklist.filter((item) => item !== taskId)
        : [...current.checklist, taskId],
    }));
  }

  if (!isReady) {
    return <div className="py-10 text-sm text-[var(--color-muted)]">{isSpanish ? "Cargando guia..." : "Loading guide..."}</div>;
  }

  return (
    <div className="py-4 lg:py-6">
      <section className="grid gap-6">
        <NewcomerGuide
          guides={guides}
          profileVisa={profile.visaStatus}
          selectedVisa={selectedVisa}
          onSelectVisa={(visa) => setSelectedVisaOverride(visa === profile.visaStatus ? null : visa)}
          zipCode={profile.zip}
          city={profile.city}
          state={profile.state}
          hasSsn={profile.hasSsn}
          completedTaskIds={profile.checklist}
          onToggleTask={toggleGuideTask}
          isPreview={selectedVisa !== profile.visaStatus}
        />
      </section>
    </div>
  );
}
