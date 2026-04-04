"use client";

export function YouTubeEmbed({
  title,
  videoId,
}: {
  title: string;
  videoId: string;
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-paper)]">
      <div className="relative aspect-video w-full">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
