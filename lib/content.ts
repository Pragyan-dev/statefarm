import apartments from "@/data/apartments.json";
import insuranceCosts from "@/data/insurance-costs.json";
import type {
  ApartmentZipData,
  Language,
  LocalizedText,
  UserProfile,
} from "@/lib/types";

export function pickText(value: string | LocalizedText, language: Language) {
  if (typeof value === "string") {
    return value;
  }

  return value[language];
}

export function formatCurrency(value: number, locale: Language = "en") {
  return new Intl.NumberFormat(locale === "es" ? "es-US" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string, language: Language) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language === "es" ? "es-US" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getZipData(zip: string) {
  return (apartments as Record<string, ApartmentZipData>)[zip] ?? (apartments as Record<string, ApartmentZipData>)["85281"];
}

export function deriveProfileLocation(zip: string) {
  const zipData = getZipData(zip);

  return {
    zip,
    city: zipData.city,
    state: zipData.state,
  };
}

export function getStateCosts(state: string) {
  return (insuranceCosts as Record<string, {
    rentersMonthly: number;
    autoLiability: number;
    autoFull: number;
    medicalMonthly: number;
    noAutoFine: number;
    licenseSuspensionDays: number;
  }>)[state] ?? (insuranceCosts as Record<string, {
    rentersMonthly: number;
    autoLiability: number;
    autoFull: number;
    medicalMonthly: number;
    noAutoFine: number;
    licenseSuspensionDays: number;
  }>)["AZ"];
}

export function affordabilityCopy(
  monthlyIncome: number,
  monthlyPremium: number,
  language: Language,
) {
  const safeIncome = monthlyIncome || 2800;
  const percent = ((monthlyPremium / safeIncome) * 100).toFixed(1);

  if (language === "es") {
    return `Eso es ${percent}% de tu ingreso mensual. Es pequeno comparado con una emergencia sin cobertura.`;
  }

  return `That is ${percent}% of your monthly income. Small compared with an uncovered emergency.`;
}

export function getProfileHeadline(profile: UserProfile, language: Language) {
  if (language === "es") {
    return `${profile.visaStatus}, ${profile.city}. Tu plan de proteccion para los proximos 30 dias.`;
  }

  return `${profile.visaStatus} in ${profile.city}. Your protection plan for the next 30 days.`;
}
