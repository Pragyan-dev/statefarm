export const LOCAL_STORAGE_SYNC_EVENT = "arrivesafe:local-storage-sync";

export interface LocalStorageSyncDetail<T> {
  key: string;
  value: T;
  sourceId?: string;
}

export function dispatchLocalStorageSync<T>(key: string, value: T, sourceId?: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(LOCAL_STORAGE_SYNC_EVENT, {
      detail: { key, value, sourceId } satisfies LocalStorageSyncDetail<T>,
    }),
  );
}
