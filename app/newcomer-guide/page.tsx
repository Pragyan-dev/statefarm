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

  function toggleGuideTask(taskId: string) {
    setProfile((current) => ({
      ...current,
      checklist: current.checklist.includes(taskId)
        ? current.checklist.filter((item) => item !== taskId)
        : [...current.checklist, taskId],
    }));
  }

  if (!isReady) {
    return (
      <div className="py-10 text-sm text-[var(--color-muted)]">
        {isSpanish ? "Cargando guia..." : "Loading guide..."}
      </div>
    );
  }

  return (
    <div className="website-page">
      <section className="sf-main-grid xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <div className="grid gap-6">
          <section className="page-hero p-6 sm:p-8 lg:p-10">
            <p className="eyebrow">{isSpanish ? "Guia para recien llegados" : "Newcomer guide"}</p>
            <h1 className="sf-section-title mt-3 max-w-[11ch]">
              {isSpanish
                ? "Instalarte en Estados Unidos implica papeleo y logistica. Mantenlos organizados."
                : "Settling into the United States means paperwork and logistics. Keep them organized."}
            </h1>
            <p className="sf-body-copy mt-4 max-w-[42rem]">
              {isSpanish
                ? "Tus primeros pasos para instalarte en Estados Unidos, mantenerte al dia y evitar retrasos comunes."
                : "Your first steps to settle into the United States, stay on track, and avoid common delays."}
            </p>
          </section>

          <NewcomerGuide
            guides={guides}
            activeVisa={profile.visaStatus}
            zipCode={profile.zip}
            completedTaskIds={profile.checklist}
            onToggleTask={toggleGuideTask}
          />
        </div>

        <aside className="sf-rail xl:sticky xl:top-28">
          <section className="sf-side-panel">
            <p className="eyebrow">{isSpanish ? "Perfil activo" : "Active profile"}</p>
            <div className="sf-side-list mt-4 text-sm text-[var(--color-muted)]">
              <div>
                {isSpanish ? "Visa" : "Visa"}: {profile.visaStatus}
              </div>
              <div>
                {isSpanish ? "ZIP" : "ZIP"}: {profile.zip || "85004"}
              </div>
              <div>
                {isSpanish ? "Estado" : "State"}: {profile.state}
              </div>
            </div>
          </section>

          <section className="panel-card">
            <p className="eyebrow">{isSpanish ? "Consejo" : "Tip"}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              {isSpanish
                ? "Usa esta guia junto con el simulador y la pagina de cobertura para convertir tareas de visa en acciones practicas."
                : "Use this guide alongside the simulator and coverage page so visa paperwork turns into practical next steps."}
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}
