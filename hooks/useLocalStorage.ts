"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dispatchLocalStorageSync, LOCAL_STORAGE_SYNC_EVENT } from "@/lib/localStorageEvents";

interface UseLocalStorageOptions {
  fallbackKeys?: string[];
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions,
) {
  const initialValueRef = useRef(initialValue);
  const fallbackKeysKey = (options?.fallbackKeys ?? []).join("|");
  const [value, setStoredValue] = useState<T>(() => initialValueRef.current);
  const [isReady, setIsReady] = useState(false);

  const readStoredValue = useCallback(() => {
    const fallbackKeys = fallbackKeysKey ? fallbackKeysKey.split("|") : [];
    const keysToRead = [key, ...fallbackKeys];
    const raw = keysToRead
      .map((storageKey) => window.localStorage.getItem(storageKey))
      .find((storageValue) => Boolean(storageValue));

    return raw ? (JSON.parse(raw) as T) : initialValueRef.current;
  }, [fallbackKeysKey, key]);

  useEffect(() => {
    try {
      setStoredValue(readStoredValue());
    } catch {
      setStoredValue(initialValueRef.current);
    } finally {
      setIsReady(true);
    }
  }, [readStoredValue]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore persistence errors and keep in-memory state.
    }
  }, [isReady, key, value]);

  const setValue = useCallback((nextValue: T | ((currentValue: T) => T)) => {
    setStoredValue((currentValue) => {
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (currentValue: T) => T)(currentValue)
          : nextValue;

      dispatchLocalStorageSync(key, resolvedValue);
      return resolvedValue;
    });
  }, [key]);

  useEffect(() => {
    function syncFromStorage() {
      try {
        setStoredValue(readStoredValue());
      } catch {
        setStoredValue(initialValueRef.current);
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key && event.key !== key) {
        return;
      }

      syncFromStorage();
    }

    function handleCustomSync(event: Event) {
      const customEvent = event as CustomEvent<{ key?: string; value?: T }>;

      if (customEvent.detail?.key !== key) {
        return;
      }

      if (customEvent.detail.value !== undefined) {
        setStoredValue(customEvent.detail.value);
        return;
      }

      syncFromStorage();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(LOCAL_STORAGE_SYNC_EVENT, handleCustomSync as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, handleCustomSync as EventListener);
    };
  }, [key, readStoredValue]);

  return [value, setValue, isReady] as const;
}
