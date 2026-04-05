import { apartmentFloodScenario } from "@/data/scenarios/apartment-flood";
import { carAccidentScenario } from "@/data/scenarios/car-accident";
import { erVisitScenario } from "@/data/scenarios/er-visit";
import { theftScenario } from "@/data/scenarios/theft";
import { formatCurrency, getStateCosts } from "@/lib/content";
import type { UserProfile } from "@/lib/types";
import type { DialogueNode, Scenario } from "@/types/simulator";

const stateNames: Record<string, string> = {
  AZ: "Arizona",
  CA: "California",
  TX: "Texas",
  NY: "New York",
};

export const allScenarios: Scenario[] = [
  carAccidentScenario,
  apartmentFloodScenario,
  theftScenario,
  erVisitScenario,
];

function replaceTokens(value: string, tokens: Record<string, string>) {
  return value.replace(/\{([^}]+)\}/g, (_, key: string) => tokens[key] ?? `{${key}}`);
}

function resolveNode(node: DialogueNode, tokens: Record<string, string>): DialogueNode {
  return {
    ...node,
    text: replaceTokens(node.text, tokens),
    showInsuranceTip: node.showInsuranceTip
      ? replaceTokens(node.showInsuranceTip, tokens)
      : undefined,
    actionCTA: node.actionCTA
      ? {
          ...node.actionCTA,
          label: replaceTokens(node.actionCTA.label, tokens),
        }
      : undefined,
    choices: node.choices?.map((choice) => ({
      ...choice,
      label: replaceTokens(choice.label, tokens),
      sublabel: choice.sublabel ? replaceTokens(choice.sublabel, tokens) : undefined,
    })),
    effect: node.effect
      ? {
          ...node.effect,
          items: node.effect.items.map((item) => ({
            ...item,
            label: replaceTokens(item.label, tokens),
          })),
          monthlyEquivalent: node.effect.monthlyEquivalent
            ? replaceTokens(node.effect.monthlyEquivalent, tokens)
            : undefined,
        }
      : undefined,
  };
}

function resolveScenario(scenario: Scenario, profile: Pick<UserProfile, "city" | "state" | "visaStatus">) {
  const costs = getStateCosts(profile.state);
  const tokens = {
    city: profile.city || "your city",
    state: stateNames[profile.state] ?? profile.state,
    autoLiability: formatCurrency(costs.autoLiability),
    rentersMonthly: formatCurrency(costs.rentersMonthly),
    medicalMonthly: formatCurrency(costs.medicalMonthly),
    carAccidentDamageTotal: formatCurrency(7000),
    floodDamageTotal: formatCurrency(2950),
    floodInsuredTotal: formatCurrency(250),
    theftDamageTotal: formatCurrency(1950),
    theftInsuredTotal: formatCurrency(250),
    erDamageTotal: formatCurrency(21700),
    erInsuredTotal: formatCurrency(250),
    healthNote:
      profile.visaStatus === "F1"
        ? "And if you are on F1 status, this is exactly why universities push health insurance so hard during orientation."
        : "If your school or employer mentioned coverage during onboarding, this is the reason they keep insisting on it.",
  };

  return {
    ...scenario,
    title: replaceTokens(scenario.title, tokens),
    subtitle: replaceTokens(scenario.subtitle, tokens),
    nodes: scenario.nodes.map((node) => resolveNode(node, tokens)),
  };
}

export function getRelevantScenarios(profile: Pick<UserProfile, "drives" | "rents" | "city" | "state" | "visaStatus">) {
  return allScenarios
    .filter((scenario) => {
      if (scenario.id === "car-accident" && !profile.drives) {
        return false;
      }

      if ((scenario.id === "apartment-flood" || scenario.id === "theft") && !profile.rents) {
        return false;
      }

      return true;
    })
    .map((scenario) => resolveScenario(scenario, profile));
}
