"use client";

import React, { useRef, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearStoredDashboardAccess } from "@/lib/dashboardAccess";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDashboardAccess } from "@/hooks/useDashboardAccess";
import { defaultUserProfile, clearStoredProfile } from "@/lib/userProfile";

export function ClearDataButton() {
  const router = useRouter();
  const [, setProfile, isReady] = useUserProfile();
  const [, setIsDashboardBuilt] = useDashboardAccess();
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!showModal) {
      // return focus to the trigger after modal closes
      buttonRef.current?.focus();
    } else {
      // focus the cancel button when modal opens
      cancelRef.current?.focus();
    }
  }, [showModal]);

  if (!isReady) return null;

  const handleOpen = () => setShowModal(true);

  const handleCancel = () => {
    if (isProcessing) return;
    setShowModal(false);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      // update in-memory profile to defaults so the storage hook writes defaults
      setProfile(defaultUserProfile);
      setIsDashboardBuilt(false);
      clearStoredProfile();
      clearStoredDashboardAccess();
      setShowModal(false);
      router.replace("/");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="relative z-10 inline-flex min-h-12 items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50 hover:text-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
      >
        <Trash2 className="size-4" />
        <span>{typeof window !== "undefined" && window.navigator.language.startsWith("es") ? "Borrar datos" : "Clear Data"}</span>
      </button>

      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-[var(--color-paper)]">
            <h3 className="text-lg font-semibold text-[var(--color-ink)]">
              {typeof window !== "undefined" && window.navigator.language.startsWith("es")
                ? "¿Borrar datos guardados?"
                : "Clear saved data?"}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {typeof window !== "undefined" && window.navigator.language.startsWith("es")
                ? "Esto eliminará tu perfil guardado y restablecerá la aplicación. Esto no se puede deshacer."
                : "This will remove your saved profile and reset the app. This cannot be undone."}
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                ref={cancelRef}
                onClick={handleCancel}
                className="rounded-md px-3 py-2 text-sm"
                disabled={isProcessing}
              >
                {typeof window !== "undefined" && window.navigator.language.startsWith("es") ? "Cancelar" : "Cancel"}
              </button>

              <button
                onClick={handleConfirm}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={isProcessing}
              >
                {isProcessing
                  ? (typeof window !== "undefined" && window.navigator.language.startsWith("es") ? "Borrando..." : "Clearing...")
                  : (typeof window !== "undefined" && window.navigator.language.startsWith("es") ? "Borrar datos" : "Clear Data")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
