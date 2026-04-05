# FirstCover

**Bilingual, accessibility-first insurance onboarding for immigrants navigating U.S. insurance for the first time.**

Built with **Next.js 16** · **React 19** · **TypeScript** · **Tailwind CSS 4**

---

## Features

### Dashboard
A personalized insurance command center. After a lightweight onboarding flow, users see a tailored checklist of insurance priorities based on their visa type, location, SSN status, and coverage needs — with deadlines, next actions, and progress tracking all in one place.

### Newcomer Guide
Week-by-week settlement guidance customized to the user's visa status (F-1, H-1B, J-1, O-1). Each task includes required documents, resource links, and Google Maps integration for finding nearby offices (SSA, DMV, etc.). Progress is tracked across sessions.

### Shock Simulator
An interactive, visual novel-style experience that puts users in real-world insurance scenarios — car accidents, apartment fires, theft — and shows the financial impact of being insured vs. uninsured. Branching storylines with character-driven narratives, animated damage reveals, and personalized outcome summaries make abstract risks feel concrete.

### Coverage
A map-first coverage explorer powered by Leaflet and OpenStreetMap. Users browse apartments by ZIP code, see estimated renters insurance premiums, explore local disaster risk via FEMA historical data, and get auto insurance cost estimates — all with State Farm integration for next steps.

### Policy Decoder
Upload any insurance policy PDF or photo and get an instant AI-powered visual breakdown. The decoder generates a health score gauge, coverage shield visualization, deductible reality comparisons, and gap warnings — turning dense legal language into clear, actionable insights.

### Claim Coach
A step-by-step visual claim guide. Users select an incident type or describe what happened using voice input, and the app generates a personalized workflow: urgency timeline, evidence collection prompts, document checklist, dos and don'ts, and one-tap quick actions to call an agent or file through the app.

---

## AI-Powered Intelligence

- **Policy Parsing** — Upload a PDF or image of any insurance policy and receive structured analysis with coverage scoring, gap detection, and plain-language explanations via OpenRouter vision models
- **Claim Classification** — Describe an incident in your own words (typed or spoken) and the AI identifies the claim type and generates a tailored response plan
- **Auto Insurance Estimation** — AI-driven cost predictions based on user profile, vehicle details, and location
- **Voice I/O** — Full speech-to-text and text-to-speech powered by ElevenLabs, with browser synthesis fallback for read-aloud functionality
- **Graceful Fallbacks** — Every AI feature includes hardcoded fallback data, ensuring the app remains fully functional without API keys

---

## Accessibility

Accessibility is a core feature, not an afterthought. A global settings panel gives users control over:

- **Language** — Full English and Spanish support across the entire UI and AI responses
- **Text Size** — Continuous range slider from 16px to 24px
- **High Contrast Mode** — Dark backgrounds with high-visibility accents
- **Reduced Motion** — Disables all animations for motion-sensitive users
- **Color-Blind Modes** — Protanopia, deuteranopia, and tritanopia filters via embedded SVG
- **Screen Reader Optimization** — Enhanced semantic markup and ARIA support
- **Voice Output** — Adjustable speech speed (0.7x–1.2x) with read-aloud on key pages

---

## Bilingual from the Ground Up

Every screen, label, button, tooltip, and AI response supports both **English** and **Spanish** via `next-intl`. Language switching is instant and persistent — no page reload required.

---

## Dual View Modes

- **Website View** — Full-width responsive layout for desktop and tablet, with header navigation, branding, and footer
- **App View** — Phone-width experience (max 430px) with bottom navigation, optimized for mobile-first use

Users can switch between modes on the fly.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 with React Compiler |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 with custom design tokens |
| Localization | next-intl (EN/ES) |
| Maps | Leaflet + react-leaflet + OpenStreetMap |
| AI | OpenRouter (Gemini Flash models) |
| Speech | ElevenLabs (STT + TTS) |
| PDF Parsing | pdf-parse |
| Icons | Lucide React |
| Export | html-to-image |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Add your API keys:

```env
OPENROUTER_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
```

Optional model overrides:

```env
OPENROUTER_MODEL=google/gemini-3-flash
OPENROUTER_IMAGE_MODEL=google/gemini-3-flash
```

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production

```bash
npm run build && npm run start
```

---

## Project Structure

```
app/
  api/                  AI, FEMA, speech, and estimation endpoints
  claim/                Visual claim guide
  coverage/             Map-based coverage finder
  dashboard/            Personalized insurance dashboard
  decode/               AI policy decoder
  newcomer-guide/       Visa-specific onboarding
  simulate/             Interactive scenario simulator

components/
  claim/                Claim timeline, checklist, evidence, voice input
  coverage/             Auto insurance estimator
  decoder/              Upload zone, health gauge, coverage shield, gap cards
  simulator/            Story engine, dialogue, choices, damage reveals
  website/              Landing page and desktop layout

data/
  apartments.json       Coverage seed data by ZIP code
  scenarios/            Branching story scenario scripts
  newcomer-guides/      Visa-specific guidance (F1, H1B, J1, O1)
  jargon.json           Insurance glossary (EN/ES)
  insurance-costs.json  Regional premium data

lib/
  parsePolicyAI.ts      AI policy analysis with fallback
  generateClaimGuide.ts Claim classification engine
  autoEstimateAI.ts     Insurance cost prediction
  fema.ts               FEMA disaster history integration
  stt.ts / tts.ts       ElevenLabs speech helpers
  openrouter.ts         Shared AI configuration

hooks/
  useAccessibility.ts   Global accessibility state
  useUserProfile.ts     Persistent user profile
  useViewMode.ts        Website/app mode toggle
  useLocalStorage.ts    SSR-safe persistent state

types/
  claim.ts              Claim guide type definitions
  policy.ts             Policy decoder types
  simulator.ts          Story simulator types

messages/
  en.json               English translations
  es.json               Spanish translations
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/decode` | POST | Parse policy PDF/image into structured visual analysis |
| `/api/claim` | POST | Classify incident text and return personalized claim guide |
| `/api/auto-estimate` | POST | Generate auto insurance cost estimate |
| `/api/fema` | GET | Fetch FEMA disaster history by ZIP code |
| `/api/stt` | POST | Speech-to-text via ElevenLabs |
| `/api/tts` | POST | Text-to-speech via ElevenLabs |
