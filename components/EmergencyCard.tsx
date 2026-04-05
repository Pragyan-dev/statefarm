"use client";

import { useRef } from "react";
import { toPng } from "html-to-image";
import claimVideos from "@/data/claim-videos.json";
import { useTranslations } from "next-intl";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { UserProfile } from "@/lib/types";

export function EmergencyCard({
  profile,
}: {
  profile: UserProfile;
}) {
  const t = useTranslations();
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const cardRef = useRef<HTMLDivElement | null>(null);

  async function handleDownload() {
    if (!cardRef.current) {
      return;
    }

    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "arrivesafe-emergency-card.png";
    link.click();
  }

  return (
    <section className="panel-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{isSpanish ? "Respaldo sin conexion" : "Offline backup"}</p>
          <h2 className="font-display text-2xl text-[var(--color-ink)]">
            {isSpanish ? "Tarjeta de emergencia" : "Emergency card"}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-full bg-[var(--color-ink)] px-4 py-3 text-sm font-semibold text-[var(--color-paper)]"
        >
          {t("downloadCard")}
        </button>
      </div>

      <div
        ref={cardRef}
        className="mt-5 rounded-[2rem] bg-[var(--color-ink)] p-5 text-[var(--color-paper)]"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">FirstCover</p>
        <h3 className="mt-2 font-display text-3xl">
          {profile.visaStatus} · {profile.state}
        </h3>
        <div className="mt-5 grid gap-4 text-sm">
          <div>
            <p className="font-semibold">{isSpanish ? "Contactos de emergencia" : "Emergency contacts"}</p>
            <p className="mt-2">{isSpanish ? "Reclamos" : "Claims"}: {claimVideos.statefarmLinks.phone}</p>
            <p>{isSpanish ? "Estado" : "State"}: {profile.state}</p>
          </div>
          <div>
            <p className="font-semibold">{isSpanish ? "Despues de un choque" : "After a car accident"}</p>
            <ol className="mt-2 grid gap-1 text-white/80">
              <li>{isSpanish ? "1. Muevete a un lugar seguro." : "1. Move to safety."}</li>
              <li>{isSpanish ? "2. Toma fotos." : "2. Take photos."}</li>
              <li>{isSpanish ? "3. Intercambia informacion." : "3. Exchange info."}</li>
              <li>{isSpanish ? "4. Llama a la aseguradora." : "4. Call the insurer."}</li>
              <li>{isSpanish ? "5. Guarda cada recibo." : "5. Save every receipt."}</li>
            </ol>
          </div>
          <div>
            <p className="font-semibold">{isSpanish ? "Despues de danos en el apartamento" : "After apartment damage"}</p>
            <ol className="mt-2 grid gap-1 text-white/80">
              <li>{isSpanish ? "1. Deten la fuente si es seguro." : "1. Stop the source if safe."}</li>
              <li>{isSpanish ? "2. Toma fotos y video." : "2. Take photos and video."}</li>
              <li>{isSpanish ? "3. Protege tus documentos clave." : "3. Protect key documents."}</li>
              <li>{isSpanish ? "4. Notifica al arrendador." : "4. Notify landlord."}</li>
              <li>{isSpanish ? "5. Empieza el reclamo rapido." : "5. Start the claim quickly."}</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
