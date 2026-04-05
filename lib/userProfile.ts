import { dispatchLocalStorageSync } from "@/lib/localStorageEvents";
import type { UserProfile } from "@/lib/types";

export const PROFILE_STORAGE_KEY = "arrivesafe-profile";
export const LEGACY_PROFILE_STORAGE_KEY = "arrivesafe_profile";

export const defaultUserProfile: UserProfile = {
  visaStatus: "F1",
  hasSsn: false,
  drives: true,
  rents: true,
  zip: "85281",
  city: "Tempe",
  state: "AZ",
  monthlyIncome: 2800,
  checklist: [],
};

export function getStoredProfile() {
  if (typeof window === "undefined") {
    return defaultUserProfile;
  }

  const raw =
    window.localStorage.getItem(PROFILE_STORAGE_KEY) ??
    window.localStorage.getItem(LEGACY_PROFILE_STORAGE_KEY);

  if (!raw) {
    return defaultUserProfile;
  }

  try {
    return { ...defaultUserProfile, ...JSON.parse(raw) } as UserProfile;
  } catch {
    return defaultUserProfile;
  }
}

export function saveStoredProfile(profile: UserProfile) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  dispatchLocalStorageSync(PROFILE_STORAGE_KEY, profile);
}
