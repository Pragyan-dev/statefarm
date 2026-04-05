export type CoverageCategory =
  | "theft"
  | "fire"
  | "water"
  | "liability"
  | "medical"
  | "natural_disaster"
  | "property"
  | "collision"
  | "comprehensive"
  | "uninsured_motorist";

export interface CoverageItem {
  category: CoverageCategory;
  label: string;
  detail?: string;
  limit?: string;
}

export interface CoverageGap {
  category: CoverageCategory;
  title: string;
  description: string;
  scenario: string;
  estimatedRisk: number;
  severity: "high" | "medium" | "low";
}

export interface PolicyAnalysis {
  provider: string;
  policyType: "auto" | "renters" | "home" | "health" | "other";
  policyNumber?: string;
  expirationDate?: string;
  monthlyCost?: number;
  healthScore: number;
  covered: CoverageItem[];
  notCovered: CoverageItem[];
  deductible: {
    amount: number;
    comparisons: string[];
  };
  gaps: CoverageGap[];
}

export interface DecoderAnalysisResponse extends PolicyAnalysis {
  aiSource?: "openrouter" | "local";
  fallbackReason?: string;
  demoMode?: boolean;
}
