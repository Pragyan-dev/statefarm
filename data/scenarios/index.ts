import { apartmentFloodScenario } from "@/data/scenarios/apartment-flood";
import { carAccidentScenario } from "@/data/scenarios/car-accident";
import { erVisitScenario } from "@/data/scenarios/er-visit";
import { kitchenFireScenario } from "@/data/scenarios/kitchen-fire";
import { parkingLotHitScenario } from "@/data/scenarios/parking-lot-hit";
import { scooterFallScenario } from "@/data/scenarios/scooter-fall";
import { theftScenario } from "@/data/scenarios/theft";
import { formatCurrency, getStateCosts } from "@/lib/content";
import type { Language, UserProfile } from "@/lib/types";
import type { DialogueNode, Scenario } from "@/types/simulator";

const stateNames: Record<string, string> = {
  AZ: "Arizona",
  CA: "California",
  TX: "Texas",
  NY: "New York",
};

export const allScenarios: Scenario[] = [
  carAccidentScenario,
  parkingLotHitScenario,
  apartmentFloodScenario,
  theftScenario,
  kitchenFireScenario,
  erVisitScenario,
  scooterFallScenario,
];

const drivingScenarioIds = new Set(["car-accident", "parking-lot-hit"]);
const renterScenarioIds = new Set(["apartment-flood", "theft", "kitchen-fire"]);
const studentVisaStatuses = new Set(["F1", "J1"]);
const workerVisaStatuses = new Set(["H1B", "O1"]);

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
  const isStudentVisa = studentVisaStatuses.has(profile.visaStatus);
  const tokens = {
    city: profile.city || "your city",
    state: stateNames[profile.state] ?? profile.state,
    dayDestination: isStudentVisa ? "campus" : "work",
    afterActivity: isStudentVisa ? "class" : "work",
    autoLiability: formatCurrency(costs.autoLiability),
    rentersMonthly: formatCurrency(costs.rentersMonthly),
    medicalMonthly: formatCurrency(costs.medicalMonthly),
    carAccidentDamageTotal: formatCurrency(7000),
    parkingDamageTotal: formatCurrency(3450),
    parkingInsuredTotal: formatCurrency(500),
    floodDamageTotal: formatCurrency(2950),
    floodInsuredTotal: formatCurrency(250),
    theftDamageTotal: formatCurrency(1950),
    theftInsuredTotal: formatCurrency(250),
    kitchenDamageTotal: formatCurrency(4100),
    kitchenInsuredTotal: formatCurrency(250),
    erDamageTotal: formatCurrency(21700),
    erInsuredTotal: formatCurrency(250),
    scooterDamageTotal: formatCurrency(2700),
    scooterInsuredTotal: formatCurrency(150),
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

function getScenarioScore(
  scenarioId: string,
  profile: Pick<UserProfile, "drives" | "rents" | "visaStatus" | "hasSsn">,
) {
  let score = 1;

  if (drivingScenarioIds.has(scenarioId) && profile.drives) {
    score += 4;
  }

  if (renterScenarioIds.has(scenarioId) && profile.rents) {
    score += 4;
  }

  if (!profile.hasSsn && drivingScenarioIds.has(scenarioId)) {
    score += 2;
  }

  if (studentVisaStatuses.has(profile.visaStatus)) {
    if (scenarioId === "theft" || scenarioId === "scooter-fall" || scenarioId === "er-visit") {
      score += 2;
    }
  }

  if (workerVisaStatuses.has(profile.visaStatus)) {
    if (drivingScenarioIds.has(scenarioId) || scenarioId === "er-visit") {
      score += 2;
    }
  }

  return score;
}

function getScenarioMatchReason(
  scenarioId: string,
  profile: Pick<UserProfile, "drives" | "rents" | "visaStatus" | "hasSsn">,
  language: Language,
) {
  const isSpanish = language === "es";
  const isStudentVisa = studentVisaStatuses.has(profile.visaStatus);
  const isWorkerVisa = workerVisaStatuses.has(profile.visaStatus);

  if (drivingScenarioIds.has(scenarioId) && profile.drives) {
    if (!profile.hasSsn) {
      return isSpanish
        ? "Elegido para ti: manejas y aun no tienes SSN."
        : "Picked for you: you drive and do not have an SSN yet.";
    }

    return isSpanish
      ? "Elegido para ti: dijiste que manejas."
      : "Picked for you: you said you drive.";
  }

  if (renterScenarioIds.has(scenarioId) && profile.rents) {
    if (isStudentVisa) {
      return isSpanish
        ? "Elegido para ti: rentas y tu visa te pone en escenarios de vivienda muy rapido."
        : "Picked for you: you rent and your visa setup makes housing risks hit fast.";
    }

    return isSpanish
      ? "Elegido para ti: dijiste que rentas."
      : "Picked for you: you said you rent.";
  }

  if (scenarioId === "scooter-fall") {
    if (isStudentVisa) {
      return isSpanish
        ? "Elegido para ti: es un riesgo comun al moverte entre clases y mandados."
        : "Picked for you: this is a common between-class and errand risk.";
    }

    return isSpanish
      ? "Elegido para ti: es un accidente pequeno que aun puede generar una factura real."
      : "Picked for you: it is a small accident that can still create a real bill.";
  }

  if (scenarioId === "er-visit") {
    if (isWorkerVisa) {
      return isSpanish
        ? "Elegido para ti: un solo gasto medico puede golpear antes de que todo se estabilice en el trabajo."
        : "Picked for you: one medical bill can hit before work and benefits feel settled.";
    }

    return isSpanish
      ? "Elegido para ti: este es el tipo de costo que descarrila un primer presupuesto."
      : "Picked for you: this is the kind of cost that derails a first budget.";
  }

  return undefined;
}

export function getRelevantScenarios(
  profile: Pick<UserProfile, "drives" | "rents" | "city" | "state" | "visaStatus" | "hasSsn">,
  language: Language = "en",
) {
  return allScenarios
    .filter((scenario) => {
      if (drivingScenarioIds.has(scenario.id) && !profile.drives) {
        return false;
      }

      if (renterScenarioIds.has(scenario.id) && !profile.rents) {
        return false;
      }

      return true;
    })
    .map((scenario) => {
      const resolvedScenario = resolveScenario(scenario, profile);

      return {
        ...resolvedScenario,
        matchReason: getScenarioMatchReason(scenario.id, profile, language),
        _score: getScenarioScore(scenario.id, profile),
      };
    })
    .sort((left, right) => right._score - left._score)
    .map((scenario) => ({
      id: scenario.id,
      title: scenario.title,
      subtitle: scenario.subtitle,
      icon: scenario.icon,
      estimatedTime: scenario.estimatedTime,
      coverImage: scenario.coverImage,
      matchReason: scenario.matchReason,
      nodes: scenario.nodes,
    }));
}
