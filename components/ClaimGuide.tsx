"use client";

import { ReadAloud } from "@/components/ReadAloud";
import { useAccessibility } from "@/hooks/useAccessibility";
import type { ClaimGuideResult } from "@/lib/types";

export function ClaimGuide({
  guide,
}: {
  guide: ClaimGuideResult;
}) {
  const { settings } = useAccessibility();
  const narration = [
    guide.immediateActions.join(". "),
    guide.documents.join(". "),
    guide.whatNotToDo.join(". "),
    guide.timeline,
  ].join(". ");

  return (
    <section className="panel-card" aria-live="polite" aria-atomic="true">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{settings.language === "es" ? "Guia de reclamo" : "Claim guide"}</p>
          <h2 className="font-display text-2xl text-[var(--color-ink)]">
            {settings.language === "es" ? "Que hacer ahora" : "What to do now"}
          </h2>
        </div>
        <ReadAloud text={narration} />
      </div>

      <div className="mt-5 space-y-5">
        <GuideSection
          title={settings.language === "es" ? "Acciones inmediatas" : "Immediate actions"}
          items={guide.immediateActions}
          numbered
        />
        <GuideSection
          title={settings.language === "es" ? "Documentos a reunir" : "Documents to gather"}
          items={guide.documents}
        />
        <GuideSection
          title={settings.language === "es" ? "Lo que no debes hacer" : "What not to do"}
          items={guide.whatNotToDo}
        />
        <GuideSection
          title={settings.language === "es" ? "Siguientes pasos" : "Follow-up steps"}
          items={guide.followUpSteps}
        />
        <div className="rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4 text-sm text-[var(--color-muted)]">
          <p className="font-semibold text-[var(--color-ink)]">
            {settings.language === "es" ? "Tiempo estimado" : "Timeline"}
          </p>
          <p className="mt-2">{guide.timeline}</p>
        </div>
      </div>
    </section>
  );
}

function GuideSection({
  title,
  items,
  numbered = false,
}: {
  title: string;
  items: string[];
  numbered?: boolean;
}) {
  return (
    <section className="rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4">
      <h3 className="font-semibold text-[var(--color-ink)]">{title}</h3>
      <ol className="mt-3 grid gap-2 text-sm text-[var(--color-muted)]">
        {items.map((item, index) => (
          <li key={item} className="flex gap-3">
            <span className="font-semibold text-[var(--color-ink)]">
              {numbered ? `${index + 1}.` : "•"}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
