import { useEffect, useState } from "react";
import { getNativeItem, setNativeItem } from "../utils/nativeStorage";

const ONBOARDING_STORAGE_KEY = "glucoflow-onboarding-accepted";

export function useOnboarding() {
  const [hasAccepted, setHasAcceptedState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Charger l'état d'onboarding au montage
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const stored = await getNativeItem(ONBOARDING_STORAGE_KEY);
        setHasAcceptedState(stored === "true");
      } catch (error) {
        console.error("Failed to load onboarding state", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadOnboardingState();
  }, []);

  const acceptOnboarding = async () => {
    try {
      await setNativeItem(ONBOARDING_STORAGE_KEY, "true");
      setHasAcceptedState(true);
    } catch (e) {
      console.warn("Failed to save onboarding acceptance", e);
    }
  };

  return { hasAccepted, acceptOnboarding, isLoading };
}
