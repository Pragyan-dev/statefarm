"use client";

import { useAccessibility } from "@/hooks/useAccessibility";
import f1Guide from "@/data/newcomer-guides/f1.json";
import h1bGuide from "@/data/newcomer-guides/h1b.json";
import j1Guide from "@/data/newcomer-guides/j1.json";
import o1Guide from "@/data/newcomer-guides/o1.json";

import { NewcomerGuide, type NewcomerGuideData } from "@/components/NewcomerGuide";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function NewcomerGuidePage() {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const [profile, setProfile, isReady] = useUserProfile();
  const guides = [f1Guide, h1bGuide, j1Guide, o1Guide] as NewcomerGuideData[];
  const selectedGuide = guides.find((guide) => guide.visa === profile.visaStatus) ?? guides[0];

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
    <div className="py-6 lg:py-10">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="panel-card hero-ambient overflow-hidden">
          <p className="eyebrow">{isSpanish ? "Guia para recien llegados" : "Newcomer guide"}</p>
          <h1 className="font-display text-4xl text-[var(--color-ink)] lg:max-w-[11ch]">
            {isSpanish
              ? "Instalarte en Estados Unidos implica papeleo y logistica. Mantenlos organizados."
              : "Settling into the United States means paperwork and logistics. Keep them organized."}
          </h1>
          <p className="mt-4 text-base text-[var(--color-muted)]">
            {isSpanish
              ? "Tus primeros pasos para instalarte en Estados Unidos, mantenerte al dia y evitar retrasos comunes."
              : "Your first steps to settle into the United States, stay on track, and avoid common delays."}
          </p>
        </section>

        <NewcomerGuide
          key={selectedGuide.visa}
          guides={[selectedGuide]}
          activeVisa={selectedGuide.visa}
          zipCode={profile.zip}
          completedTaskIds={profile.checklist}
          onToggleTask={toggleGuideTask}
        />
      </section>
    </div>
  );
}
