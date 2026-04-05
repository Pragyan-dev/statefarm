"use client";

import { useEffect, useRef, useState } from "react";

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
  const [value, setValue] = useState<T>(() => initialValueRef.current);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const fallbackKeys = fallbackKeysKey ? fallbackKeysKey.split("|") : [];
      const keysToRead = [key, ...fallbackKeys];
      const raw = keysToRead
        .map((storageKey) => window.localStorage.getItem(storageKey))
        .find((storageValue) => Boolean(storageValue));

      if (raw) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      setValue(initialValueRef.current);
    } finally {
      setIsReady(true);
    }
  }, [fallbackKeysKey, key]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(value));
  }, [isReady, key, value]);

  return [value, setValue, isReady] as const;
}
