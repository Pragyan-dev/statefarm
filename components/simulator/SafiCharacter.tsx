"use client";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { Emotion } from "@/types/simulator";

interface SafiCharacterProps {
  emotion: Emotion;
  className?: string;
}

function FaceLayer({
  emotion,
  className,
}: {
  emotion: Emotion;
  className?: string;
}) {
  const eyeColor = "#2C2C2A";
  const blushVisible = emotion === "happy" || emotion === "celebrating";
  const celebrating = emotion === "celebrating";
  const shocked = emotion === "shocked";
  const worried = emotion === "worried";
  const happy = emotion === "happy" || emotion === "celebrating";

  return (
    <g className={className}>
      {worried ? (
        <>
          <path d="M41 54 L50 51" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M70 51 L79 54" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : null}

      {happy ? (
        <>
          <path d="M42 58 Q48 52 54 58" fill="none" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M66 58 Q72 52 78 58" fill="none" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
        </>
      ) : shocked ? (
        <>
          <circle cx="48" cy="58" r="7" fill="none" stroke={eyeColor} strokeWidth="3" />
          <circle cx="72" cy="58" r="7" fill="none" stroke={eyeColor} strokeWidth="3" />
        </>
      ) : (
        <>
          <circle cx="48" cy="58" r="5" fill={eyeColor} />
          <circle cx="72" cy="58" r="5" fill={eyeColor} />
        </>
      )}

      <path
        d="M60 65 L54 72 H66 Z"
        fill="#EF9F27"
        stroke={eyeColor}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {shocked ? (
        <circle cx="60" cy="84" r="6" fill="none" stroke={eyeColor} strokeWidth="3" />
      ) : worried ? (
        <path d="M50 88 Q60 82 70 88" fill="none" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
      ) : happy ? (
        <path d="M48 82 Q60 94 72 82" fill="none" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
      ) : (
        <path d="M51 84 Q60 89 69 84" fill="none" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
      )}

      {blushVisible ? (
        <>
          <ellipse cx="36" cy="73" rx="6.5" ry="4.5" fill="#F4C0D1" opacity="0.9" />
          <ellipse cx="84" cy="73" rx="6.5" ry="4.5" fill="#F4C0D1" opacity="0.9" />
        </>
      ) : null}

      {celebrating ? (
        <>
          <path d="M27 40 L31 31 L35 40 L44 44 L35 48 L31 57 L27 48 L18 44 Z" fill="#EF9F27" opacity="0.95" />
          <path d="M85 30 L88 24 L91 30 L97 33 L91 36 L88 42 L85 36 L79 33 Z" fill="#EF9F27" opacity="0.95" />
        </>
      ) : null}
    </g>
  );
}

export function SafiCharacter({ emotion, className = "" }: SafiCharacterProps) {
  const { settings } = useAccessibility();
  const allEmotions: Emotion[] = ["neutral", "happy", "worried", "shocked", "celebrating"];

  const wingPath =
    emotion === "celebrating"
      ? "M23 87 C18 65 22 44 35 31 C33 49 39 66 47 80"
      : "M24 89 C20 73 24 57 36 43 C37 59 41 72 47 81";
  const wingPathRight =
    emotion === "celebrating"
      ? "M97 87 C102 65 98 44 85 31 C87 49 81 66 73 80"
      : "M96 89 C100 73 96 57 84 43 C83 59 79 72 73 81";

  return (
    <div className={`relative ${settings.reducedMotion ? "" : "sim-safi-idle"} ${className}`}>
      <svg
        viewBox="0 0 120 160"
        role="img"
        aria-label={`Safi looking ${emotion}`}
        className="h-full w-full"
      >
        <g fill="none" stroke="#2C2C2A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={wingPath} fill="#F5F0E8" />
          <path d={wingPathRight} fill="#F5F0E8" />
          <ellipse cx="60" cy="92" rx="34" ry="42" fill="#F5F0E8" />
          <ellipse cx="60" cy="55" rx="28" ry="26" fill="#F5F0E8" />
          <path d="M44 27 L39 13 L53 22" fill="#F5F0E8" />
          <path d="M76 27 L81 13 L67 22" fill="#F5F0E8" />
          <ellipse cx="50" cy="96" rx="12" ry="15" fill="#FBF6EF" opacity="0.9" />
          <ellipse cx="70" cy="96" rx="12" ry="15" fill="#FBF6EF" opacity="0.9" />
          <path d="M40 108 C49 116 71 116 80 108" fill="none" />
          <path d="M36 118 H84 V126 C76 133 44 133 36 126 Z" fill="#E85D30" />
          <path d="M68 118 V139 L57 132" fill="#E85D30" />
          <path d="M48 136 L43 149" />
          <path d="M72 136 L77 149" />
        </g>

        {allEmotions.map((faceEmotion) => (
          <FaceLayer
            key={faceEmotion}
            emotion={faceEmotion}
            className={
              settings.reducedMotion
                ? faceEmotion === emotion
                  ? "opacity-100"
                  : "opacity-0"
                : faceEmotion === emotion
                  ? "opacity-100 transition-opacity duration-200"
                  : "opacity-0 transition-opacity duration-200"
            }
          />
        ))}
      </svg>
    </div>
  );
}
