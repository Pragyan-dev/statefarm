# ArriveSafe

ArriveSafe is a bilingual, mobile-first insurance onboarding app built for immigrants navigating US insurance for the first time. It combines guided education, visual explainers, AI-assisted decoding, claim support, and scenario-based storytelling in a single Next.js App Router app.

The product supports two modes:

- `Website view`: a wider desktop/tablet layout for demos and judges
- `App view`: a phone-width experience optimized for `max-width: 430px`

The current implementation uses ElevenLabs for speech-to-text and text-to-speech, and Leaflet/OpenStreetMap for map-based coverage exploration.

## What the app includes

- `Intake / dashboard flow`: collects a lightweight user profile and turns it into a personalized insurance checklist
- `Coverage finder`: map-first renters coverage explorer with apartment pins, ZIP-specific risk context, FEMA-backed disaster history, and State Farm links
- `Visual policy decoder`: upload a policy PDF or image, then render a score gauge, coverage shield, deductible comparison, and gap warnings
- `Visual claim guide`: choose an incident or describe it in your own words, then get a step-by-step visual claim workflow with evidence prompts and quick actions
- `Story simulator`: visual novel-style “what happens if…” scenarios for immigrant-first insurance education
- `Visa guide`: timeline-based visa insurance guidance
- `Accessibility controls`: language, text size, reduced motion, high contrast, color-blind modes, screen-reader optimization, and voice output

## Tech stack

- `Next.js 16` with App Router
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `next-intl` for EN/ES UI localization
- `Leaflet` + `react-leaflet` for coverage maps
- `pdf-parse` for uploaded PDF extraction
- `Lucide React` for icons
- `OpenRouter` for policy parsing, scam analysis, and claim-incident classification
- `ElevenLabs` for speech-to-text and text-to-speech

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page and app overview |
| `/intake` | Profile onboarding |
| `/dashboard` | Personalized insurance dashboard |
| `/coverage` | Coverage finder with map, apartment selector, and FEMA context |
| `/decode` | Visual policy decoder |
| `/claim` | Visual claim guide |
| `/simulate` | Scenario selector and immersive simulator |
| `/guide` | Visa-specific insurance guidance |

## API routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/claim` | `POST` | Classifies a free-text incident and returns personalized claim tips |
| `/api/decode` | `POST` | Parses uploaded policy PDFs/images and returns structured visual analysis |
| `/api/fema` | `GET` | Returns FEMA disaster history |
| `/api/stt` | `POST` | ElevenLabs speech-to-text for claim voice input |
| `/api/tts` | `POST` | ElevenLabs text-to-speech for read-aloud support |

## AI usage

AI-backed flows are:

- `Policy decoder` via `/api/decode`
- `Claim guide` classification when the user describes an incident instead of selecting a category

## Speech features

- `Claim voice input`: records audio in the browser, sends it to `/api/stt`, and transcribes with ElevenLabs
- `Read aloud`: selected pages can read content back via `/api/tts`, with browser speech synthesis as a last-resort fallback

## Environment variables

Copy `.env.example` to `.env` and fill in the required keys.

```bash
cp .env.example .env
```

### Required

```env
OPENROUTER_API_KEY=
ELEVENLABS_API_KEY=
```

### Optional but recommended

```env
OPENROUTER_MODEL=google/gemini-3-flash
OPENROUTER_IMAGE_MODEL=google/gemini-3-flash
```

Notes:

- `OPENROUTER_MODEL` is used for text-only OpenRouter requests
- `OPENROUTER_IMAGE_MODEL` is used for image-based policy parsing in `/decode`
- If OpenRouter is missing or fails, claim classification and decode still return fallback results
- If ElevenLabs is missing, STT/TTS routes will fail

## Getting started

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open:

- [http://localhost:3000](http://localhost:3000)

Production build:

```bash
npm run build
npm run start
```

Lint:

```bash
npm run lint
```

## Project structure

```text
app/
  api/                 Route handlers for AI, FEMA, STT, and TTS
  claim/               Visual claim guide page
  coverage/            Coverage finder page
  decode/              Visual policy decoder
  simulate/            Scenario selector + simulator
  ...                  Other app routes

components/
  claim/               Claim guide UI
  decoder/             Policy decoder UI
  simulator/           Story simulator UI
  ...                  Shared shell, accessibility, cards, toggles

data/
  apartments.json      Coverage/map seed data
  claim-videos.json    State Farm links + video metadata
  scenarios/           Story simulator data
  visa-guides/         Visa-specific guidance content

lib/
  claimContent.ts      Hardcoded bilingual claim-guide templates
  generateClaimGuide.ts Claim classification helper
  parsePolicyAI.ts     Policy parsing + mock fallback
  fema.ts              FEMA fetch + fallback logic
  stt.ts               ElevenLabs speech-to-text helper
  tts.ts               ElevenLabs text-to-speech helper
  openrouter.ts        Shared OpenRouter config
  userProfile.ts       Profile storage helpers

types/
  claim.ts             Claim-guide types
  policy.ts            Policy-decoder types
  simulator.ts         Simulator types

```

## Accessibility

Accessibility settings are available globally and currently support:

- English / Spanish
- normal / large / XL text
- high contrast
- reduced motion
- color-blind modes
- screen-reader optimized presentation
- voice output speed

