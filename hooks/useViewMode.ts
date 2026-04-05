"use client";

import { useContext } from "react";

import { ViewModeContext } from "@/components/ViewModeProvider";

export function useViewMode() {
  const context = useContext(ViewModeContext);

  if (!context) {
    throw new Error("useViewMode must be used inside ViewModeProvider");
  }

  return context;
}
