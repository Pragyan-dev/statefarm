"use client";

import { useContext } from "react";

import { DashboardAccessContext } from "@/components/DashboardAccessProvider";

export function useDashboardAccess() {
  const context = useContext(DashboardAccessContext);

  if (!context) {
    throw new Error("useDashboardAccess must be used inside DashboardAccessProvider");
  }

  return [context.isDashboardBuilt, context.setIsDashboardBuilt, context.isReady] as const;
}
