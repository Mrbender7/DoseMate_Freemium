import { useEffect, useState } from "react";
import { getSecureItem, setSecureItem } from "../utils/secureStorage";

const ONBOARDING_STORAGE_KEY = "glucoflow-onboarding-accepted";

export function useOnboarding() {
  const [hasAccepted, setHasAcceptedState] = useState<boolean>(() => {
    try {
      const stored = getSecureItem(ONBOARDING_STORAGE_KEY);
      return stored === "true";
    } catch {
      return false;
    }
  });

  const acceptOnboarding = () => {
    try {
      setSecureItem(ONBOARDING_STORAGE_KEY, "true");
      setHasAcceptedState(true);
    } catch (e) {
      console.warn("Failed to save onboarding acceptance", e);
    }
  };

  return { hasAccepted, acceptOnboarding };
}
