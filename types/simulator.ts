export type Emotion = "neutral" | "happy" | "worried" | "shocked" | "celebrating" | "hurt";

export type Speaker = "safi" | "narrator" | "system";

export interface FinancialItem {
  label: string;
  amount: number;
  icon?: string;
}

export interface FinancialEffect {
  type: "damage" | "saved" | "comparison";
  items: FinancialItem[];
  total: number;
  monthlyEquivalent?: string;
}

export interface DialogueChoice {
  label: string;
  sublabel?: string;
  next: string;
  emoji?: string;
}

export interface DialogueNode {
  id: string;
  speaker: Speaker;
  text: string;
  emotion?: Emotion;
  choices?: DialogueChoice[];
  next?: string;
  effect?: FinancialEffect;
  delay?: number;
  showInsuranceTip?: string;
  isEnding?: boolean;
  endingType?: "bad" | "good";
  actionCTA?: {
    label: string;
    href: string;
  };
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  estimatedTime: string;
  coverImage?: string;
  nodes: DialogueNode[];
}

export interface CompletionSummary {
  scenarioId: string;
  endingType: "bad" | "good";
  finalTotal: number;
  savedAmount?: number;
  completedAt: string;
}
