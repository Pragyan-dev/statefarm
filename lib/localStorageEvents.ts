export const LOCAL_STORAGE_SYNC_EVENT = "arrivesafe:local-storage-sync";

export function dispatchLocalStorageSync<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(LOCAL_STORAGE_SYNC_EVENT, {
      detail: { key, value },
    }),
  );
}
