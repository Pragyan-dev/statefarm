"use client";

import { useMemo, useState } from "react";
import claimVideos from "@/data/claim-videos.json";

import { ClaimGuide } from "@/components/ClaimGuide";
import { EmergencyCard } from "@/components/EmergencyCard";
import { VoiceInput } from "@/components/VoiceInput";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { ClaimGuideResult } from "@/lib/types";

interface ClaimVideosData {
  auto_accident: Array<{ title: string; youtubeId: string }>;
  renters_claim: Array<{ title: string; youtubeId: string }>;
  theft: Array<{ title: string; youtubeId: string }>;
  statefarmLinks: {
    fileClaim: string;
    autoClaims: string;
    homeClaims: string;
    phone: string;
    appIos: string;
    appAndroid: string;
  };
}

export default function ClaimPage() {
  const [profile, , isReady] = useUserProfile();
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState<ClaimGuideResult | null>(null);
  const videos = useMemo(() => claimVideos as ClaimVideosData, []);

  async function handleSubmit() {
    setLoading(true);
    try {
      const response = await fetch("/api/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          language: settings.language,
        }),
      });

      const payload = (await response.json()) as ClaimGuideResult;
      setGuide(payload);
    } finally {
      setLoading(false);
    }
  }

  const matchedVideos = guide ? videos[guide.claimType] ?? [] : [];

  return (
    <div className="website-page">
      <section className="sf-main-grid lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <div className="grid gap-6">
          <section className="page-hero p-6 sm:p-8 lg:p-10">
            <p className="eyebrow">{isSpanish ? "Guia de reclamo" : "Claim coach"}</p>
            <h1 className="sf-section-title mt-3 max-w-[11ch]">
              {isSpanish
                ? "Cuenta el incidente en voz alta. Recibe los siguientes pasos en lenguaje claro."
                : "Speak the incident out loud. Get the next steps in plain language."}
            </h1>
            <p className="sf-body-copy mt-4 max-w-[42rem]">
              {isSpanish
                ? "Esto sirve para choques, danos en el apartamento, robos y esos momentos incomodos cuando el ingles no es tu primer idioma."
                : "This works for car accidents, apartment damage, theft, and the awkward claims moments when English is not your first language."}
            </p>
          </section>

          <section className="sf-band p-6 sm:p-8">
            <p className="eyebrow">{isSpanish ? "Describe el incidente" : "Describe the incident"}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {isSpanish
                ? "Habla o escribe lo que paso. Luego FirstCover resumira las acciones inmediatas, documentos y enlaces oficiales."
                : "Speak or type what happened. FirstCover will summarize immediate actions, documents, and official links next."}
            </p>
            <div className="mt-5">
              <VoiceInput value={description} onChange={setDescription} />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!description || loading}
              className="button-ink mt-5 w-full px-5 text-sm font-semibold disabled:opacity-50"
            >
              {loading
                ? isSpanish
                  ? "Generando guia de reclamo..."
                  : "Generating claim guide..."
                : isSpanish
                  ? "Generar guia de reclamo"
                  : "Generate claim guide"}
            </button>
          </section>

          {guide ? <ClaimGuide guide={guide} /> : null}
        </div>

        <aside className="sf-rail">
          <section className="sf-side-panel">
            <p className="eyebrow">{isSpanish ? "Acciones de State Farm" : "State Farm actions"}</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
              {isSpanish ? "Ayuda rapida" : "Quick help"}
            </h2>
            <div className="mt-4 grid gap-3">
              <a
                href={`tel:${videos.statefarmLinks.phone}`}
                className="button-ink px-5 py-3 text-center text-sm font-semibold"
              >
                {isSpanish ? `Llamar reclamos: ${videos.statefarmLinks.phone}` : `Call claims: ${videos.statefarmLinks.phone}`}
              </a>
              <a
                href={videos.statefarmLinks.fileClaim}
                target="_blank"
                rel="noreferrer"
                className="button-secondary px-5 py-3 text-center text-sm font-semibold"
              >
                {isSpanish ? "Presentar en linea" : "File online"}
              </a>
              <a
                href={videos.statefarmLinks.appIos}
                target="_blank"
                rel="noreferrer"
                className="button-secondary px-5 py-3 text-center text-sm font-semibold"
              >
                {isSpanish ? "Abrir app movil" : "Open mobile app"}
              </a>
            </div>
          </section>

          {matchedVideos.length ? (
            <section className="panel-card">
              <p className="eyebrow">{isSpanish ? "Aprende con video" : "Learn by video"}</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
                {isSpanish
                  ? "Mira una vez el flujo exacto del reclamo antes de llamar."
                  : "Watch the exact claim flow once before you call."}
              </h2>
              <div className="mt-5 grid gap-4">
                {matchedVideos.map((video) => (
                  <div key={video.youtubeId} className="grid gap-3">
                    <YouTubeEmbed title={video.title} videoId={video.youtubeId} />
                    <p className="text-sm text-[var(--color-muted)]">{video.title}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {isReady ? <EmergencyCard profile={profile} /> : null}
        </aside>
      </section>
    </div>
  );
}
