import type { LucideIcon } from "lucide-react";

export type IncidentType =
  | "car_accident"
  | "apartment_flood"
  | "theft"
  | "fire"
  | "weather_damage"
  | "medical_emergency"
  | "other";

export interface IncidentCategory {
  type: IncidentType;
  icon: LucideIcon;
  label: string;
  sublabel: string;
  color: string;
  urgency: "immediate" | "within_24h" | "within_week";
}

export interface ClaimStep {
  id: string;
  order: number;
  title: string;
  description: string;
  icon: LucideIcon;
  urgency: "now" | "soon" | "later";
  timeframe: string;
  details: string[];
  warning?: string;
  completed: boolean;
}

export interface EvidenceItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  required: boolean;
  captured: boolean;
  imageUrl?: string;
  tips: string;
}

export interface DoDontItem {
  text: string;
  explanation: string;
  icon: LucideIcon;
}

export interface DocumentItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  collected: boolean;
  where_to_find: string;
}

export interface ClaimGuide {
  incidentType: IncidentType;
  urgencyLevel: "immediate" | "within_24h" | "within_week";
  urgencyMessage: string;
  steps: ClaimStep[];
  evidence: EvidenceItem[];
  dos: DoDontItem[];
  donts: DoDontItem[];
  documents: DocumentItem[];
  estimatedTimeline: string;
  stateFarmPhone: string;
  stateFarmClaimUrl: string;
}

export interface ClaimGuidePersonalization {
  incidentType: IncidentType;
  urgency: "immediate" | "within_24h" | "within_week";
  urgencyMessage: string;
  personalizedTips: string[];
  estimatedTimeline: string;
  aiSource?: "openrouter" | "local";
  demoMode?: boolean;
  fallbackReason?: string;
}

export interface ClaimProgressState {
  completedStepIds: string[];
  collectedDocumentIds: string[];
  capturedEvidenceIds: string[];
}
