"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { defaultUserProfile } from "@/lib/userProfile";

export function useUserProfile() {
  return useLocalStorage("arrivesafe-profile", defaultUserProfile);
}
