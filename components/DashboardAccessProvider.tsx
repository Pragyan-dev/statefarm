"use client";

import { createContext, useEffect, useMemo, useState } from "react";

import {
  getStoredDashboardAccess,
  saveStoredDashboardAccess,
} from "@/lib/dashboardAccess";

export const DashboardAccessContext = createContext<{
  isDashboardBuilt: boolean;
  isReady: boolean;
  setIsDashboardBuilt: (value: boolean) => void;
} | null>(null);

export function DashboardAccessProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDashboardBuilt, setIsDashboardBuilt] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialize = window.setTimeout(() => {
      setIsDashboardBuilt(getStoredDashboardAccess());
      setIsReady(true);
    }, 0);

    return () => {
      window.clearTimeout(initialize);
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    saveStoredDashboardAccess(isDashboardBuilt);
  }, [isDashboardBuilt, isReady]);

  const value = useMemo(
    () => ({
      isDashboardBuilt,
      isReady,
      setIsDashboardBuilt,
    }),
    [isDashboardBuilt, isReady],
  );

  return (
    <DashboardAccessContext.Provider value={value}>
      {children}
    </DashboardAccessContext.Provider>
  );
}
