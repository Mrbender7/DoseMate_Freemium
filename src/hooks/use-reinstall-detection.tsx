import { useEffect, useState } from "react";
import { Preferences } from "@capacitor/preferences";
import { getNativeItem, clearNativeStorage } from "../utils/nativeStorage";
import {
  STORAGE_KEY,
  STORAGE_META_KEY,
  STORAGE_CUSTOM_TABLE_KEY,
} from "../types/insulin";

const INITIAL_RUN_KEY = "dosemate_initial_run_completed";
const ONBOARDING_KEY = "glucoflow-onboarding-accepted";
const PALETTE_KEY = "glucoflow-palette";

/**
 * Hook de détection de réinstallation
 * Détecte si l'app a été réinstallée avec des données résiduelles
 */
export function useReinstallDetection() {
  const [showCleanupModal, setShowCleanupModal] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isCleaningUp, setIsCleaningUp] = useState<boolean>(false);

  useEffect(() => {
    const checkReinstallation = async () => {
      try {
        console.log("[ReinstallDetection] Checking for reinstallation...");

        // Vérifie le marqueur de première exécution (NON chiffré, directement dans Preferences)
        const { value: initialRunCompleted } = await Preferences.get({ key: INITIAL_RUN_KEY });
        console.log("[ReinstallDetection] Initial run marker:", initialRunCompleted);

        if (initialRunCompleted === "true") {
          // Marqueur existe et est true = pas de réinstallation
          console.log("[ReinstallDetection] App already initialized, no cleanup needed");
          setIsChecking(false);
          return;
        }

        // Marqueur absent ou false = première exécution OU réinstallation
        // Vérifie si des données chiffrées existent
        console.log("[ReinstallDetection] Checking for residual encrypted data...");

        const hasHistory = await getNativeItem(STORAGE_KEY);
        const hasMeta = await getNativeItem(STORAGE_META_KEY);
        const hasCustomTable = await getNativeItem(STORAGE_CUSTOM_TABLE_KEY);
        const hasOnboarding = await getNativeItem(ONBOARDING_KEY);
        const hasPalette = await getNativeItem(PALETTE_KEY);

        const hasResidualData = !!(hasHistory || hasMeta || hasCustomTable || hasOnboarding || hasPalette);

        console.log("[ReinstallDetection] Residual data check:", {
          hasHistory: !!hasHistory,
          hasMeta: !!hasMeta,
          hasCustomTable: !!hasCustomTable,
          hasOnboarding: !!hasOnboarding,
          hasPalette: !!hasPalette,
          hasResidualData,
        });

        if (hasResidualData) {
          // Données résiduelles détectées = probable réinstallation
          console.log("[ReinstallDetection] Residual data detected, showing cleanup modal");
          setShowCleanupModal(true);
        } else {
          // Aucune donnée résiduelle = vraie première installation
          console.log("[ReinstallDetection] No residual data, marking as initialized");
          await Preferences.set({ key: INITIAL_RUN_KEY, value: "true" });
        }
      } catch (error) {
        console.error("[ReinstallDetection] Error during check:", error);
        // En cas d'erreur, on marque quand même comme initialisé pour éviter de bloquer l'app
        await Preferences.set({ key: INITIAL_RUN_KEY, value: "true" });
      } finally {
        setIsChecking(false);
      }
    };

    checkReinstallation();
  }, []);

  /**
   * Nettoie toutes les données chiffrées et marque comme initialisé
   */
  const cleanupResidualData = async () => {
    try {
      setIsCleaningUp(true);
      console.log("[ReinstallDetection] Starting cleanup of residual data...");

      // Efface toutes les données chiffrées via nativeStorage
      await clearNativeStorage();
      console.log("[ReinstallDetection] Encrypted data cleared");

      // Marque l'app comme initialisée (NON chiffré)
      await Preferences.set({ key: INITIAL_RUN_KEY, value: "true" });
      console.log("[ReinstallDetection] Initial run marker set");

      setShowCleanupModal(false);
      
      // Recharge l'application pour repartir à zéro
      window.location.reload();
    } catch (error) {
      console.error("[ReinstallDetection] Error during cleanup:", error);
      setIsCleaningUp(false);
    }
  };

  /**
   * Garde les anciennes données et marque comme initialisé
   */
  const keepResidualData = async () => {
    try {
      console.log("[ReinstallDetection] User chose to keep residual data");
      await Preferences.set({ key: INITIAL_RUN_KEY, value: "true" });
      setShowCleanupModal(false);
    } catch (error) {
      console.error("[ReinstallDetection] Error setting marker:", error);
      setShowCleanupModal(false);
    }
  };

  return {
    showCleanupModal,
    isChecking,
    isCleaningUp,
    cleanupResidualData,
    keepResidualData,
  };
}
