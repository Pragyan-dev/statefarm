"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { defaultUserProfile, LEGACY_PROFILE_STORAGE_KEY, PROFILE_STORAGE_KEY } from "@/lib/userProfile";

export function useUserProfile() {
  return useLocalStorage(PROFILE_STORAGE_KEY, defaultUserProfile, {
    fallbackKeys: [LEGACY_PROFILE_STORAGE_KEY],
  });
}
