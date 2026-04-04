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
    <div className="py-6">
      <section className="panel-card hero-ambient overflow-hidden">
        <p className="eyebrow">Claim coach</p>
        <h1 className="font-display text-4xl text-[var(--color-ink)]">
          Speak the incident out loud. Get the next steps in plain language.
        </h1>
        <p className="mt-4 text-base text-[var(--color-muted)]">
          This works for car accidents, apartment damage, theft, and the awkward claims moments
          when English is not your first language.
        </p>
      </section>

      <VoiceInput value={description} onChange={setDescription} />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!description || loading}
        className="mt-4 min-h-12 w-full rounded-full bg-[var(--color-ink)] px-5 text-sm font-semibold text-[var(--color-paper)] disabled:opacity-50"
      >
        {loading ? "Generating claim guide..." : "Generate claim guide"}
      </button>

      {guide ? <ClaimGuide guide={guide} /> : null}

      {matchedVideos.length ? (
        <section className="panel-card">
          <p className="eyebrow">Learn by video</p>
          <h2 className="font-display text-2xl text-[var(--color-ink)]">
            Watch the exact claim flow once before you call.
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

      <section className="panel-card">
        <p className="eyebrow">State Farm actions</p>
        <div className="mt-4 grid gap-3">
          <a
            href={`tel:${videos.statefarmLinks.phone}`}
            className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-center text-sm font-semibold text-[var(--color-paper)]"
          >
            Call claims: {videos.statefarmLinks.phone}
          </a>
          <a
            href={videos.statefarmLinks.fileClaim}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[var(--color-border)] px-5 py-3 text-center text-sm font-semibold text-[var(--color-ink)]"
          >
            File online
          </a>
          <a
            href={videos.statefarmLinks.appIos}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[var(--color-border)] px-5 py-3 text-center text-sm font-semibold text-[var(--color-ink)]"
          >
            Open mobile app
          </a>
        </div>
      </section>

      {isReady ? <EmergencyCard profile={profile} /> : null}
    </div>
  );
}
