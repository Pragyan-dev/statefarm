export type Language = "en" | "es";
export type TextSize = "normal" | "large" | "xl";
export type ColorBlindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";
export type VisaType = "F1" | "H1B" | "J1" | "O1";
export type ViewMode = "website" | "app";

export interface LocalizedText {
  en: string;
  es: string;
}

export interface AccessibilitySettings {
  language: Language;
  textSize: TextSize;
  highContrast: boolean;
  colorBlindMode: ColorBlindMode;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  voiceOutput: boolean;
  voiceSpeed: number;
}

export interface UserProfile {
  visaStatus: VisaType;
  hasSsn: boolean;
  drives: boolean;
  rents: boolean;
  zip: string;
  city: string;
  state: string;
  monthlyIncome: number;
  checklist: string[];
}

export interface ScenarioData {
  id: string;
  title: LocalizedText;
  appliesIf: "drives" | "rents" | "always";
  without: {
    total: number;
    headline: LocalizedText;
    narrative: LocalizedText;
  };
  with: {
    annual: number;
    outOfPocket: number;
    headline: LocalizedText;
    narrative: LocalizedText;
  };
}

export interface ApartmentListing {
  name: string;
  address: string;
  rentRange: string;
  beds: string;
  estimate: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  coverage: {
    personalProperty: number;
    liability: number;
    lossOfUse: number;
    deductible: number;
  };
}

export interface ApartmentZipData {
  city: string;
  state: string;
  center: {
    lat: number;
    lng: number;
  };
  topRisks: LocalizedText[];
  avgRenters: number;
  apartments: ApartmentListing[];
}

export interface PolicySummaryResult {
  provider: string;
  type: string;
  covered: string[];
  notCovered: string[];
  deductible: {
    amount: number;
    analogy: string;
  };
  monthlyCost: number;
  expires: string;
  score: "basic" | "good" | "great";
  gaps: string[];
  summary: string;
  sourceText?: string;
  demoMode?: boolean;
  aiSource?: "openrouter" | "local";
  fallbackReason?: string;
}

export interface ClaimGuideResult {
  immediateActions: string[];
  documents: string[];
  whatNotToDo: string[];
  timeline: string;
  followUpSteps: string[];
  claimType: "auto_accident" | "renters_claim" | "theft";
  demoMode?: boolean;
  aiSource?: "openrouter" | "local";
  fallbackReason?: string;
}

export type ScamFlag = "SCAM" | "PREDATORY" | "WARNING" | "SAFE";

export interface ScamVerdictResult {
  verdict: ScamFlag;
  explanation: string;
  reasons: string[];
  matchedPattern?: string;
  demoMode?: boolean;
  aiSource?: "openrouter" | "local";
  fallbackReason?: string;
}

export interface NewcomerGuideStep {
  week: number;
  step: LocalizedText;
  details: LocalizedText;
  docs: string[];
  mapsQuery?: string | null;
  resources?: Array<{
    label: LocalizedText;
    href: string;
  }>;
  link: string | null;
}

// Backwards compatibility type alias (update imports to NewcomerGuideStep)
export type VisaGuideStep = NewcomerGuideStep;
