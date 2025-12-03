import { useEffect, useState } from "react";
import { getNativeItem, setNativeItem } from "../utils/nativeStorage";

export type PaletteType = "blue" | "mint" | "rose" | "lavender" | "peach" | "red" | "cyan";

const PALETTE_STORAGE_KEY = "glucoflow-palette";

export const PALETTES = {
  blue: {
    name: "Bleuté",
    emoji: "💙",
  },
  mint: {
    name: "Vert menthe",
    emoji: "🌿",
  },
  rose: {
    name: "Rose poudré",
    emoji: "🌸",
  },
  lavender: {
    name: "Lavande",
    emoji: "💜",
  },
  peach: {
    name: "Pêche",
    emoji: "🍑",
  },
  red: {
    name: "Fraise",
    emoji: "🍓",
  },
  cyan: {
    name: "Lagon",
    emoji: "🌊",
  },
} as const;

// Fonction de validation pour verifier qu'une valeur est une palette valide
function isValidPalette(value: string): value is PaletteType {
  return ["blue", "mint", "rose", "lavender", "peach", "red", "cyan"].includes(value);
}

export function usePalette() {
  const [palette, setPaletteState] = useState<PaletteType>("blue");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Charger la palette au montage
  useEffect(() => {
    const loadPalette = async () => {
      try {
        const stored = await getNativeItem(PALETTE_STORAGE_KEY);
        console.log('[Palette] Loaded from storage:', stored);

        // Valider que la valeur chargee est une palette valide
        if (stored && isValidPalette(stored)) {
          setPaletteState(stored);
          document.documentElement.setAttribute("data-palette", stored);
          console.log('[Palette] Applied palette:', stored);
        } else {
          console.log('[Palette] Invalid or missing palette, using default: blue');
          document.documentElement.setAttribute("data-palette", "blue");
        }
      } catch (error) {
        console.error("[Palette] Failed to load palette", error);
        document.documentElement.setAttribute("data-palette", "blue");
      } finally {
        setIsLoading(false);
        // Marquer comme initialisé APRÈS un délai pour éviter la race condition
        setTimeout(() => {
          setIsInitialized(true);
          console.log('[Palette] Initialization complete');
        }, 100);
      }
    };
    loadPalette();
  }, []);

  // Sauvegarder la palette à chaque changement (seulement après initialisation)
  useEffect(() => {
    // Ne pas sauvegarder pendant le chargement initial ou avant l'initialisation
    if (isLoading || !isInitialized) {
      console.log('[Palette] Skipping save - loading:', isLoading, 'initialized:', isInitialized);
      return;
    }
    
    const savePalette = async () => {
      try {
        console.log('[Palette] Saving palette:', palette);
        await setNativeItem(PALETTE_STORAGE_KEY, palette);
        document.documentElement.setAttribute("data-palette", palette);
        console.log('[Palette] Palette saved successfully');
      } catch (e) {
        console.error("[Palette] Failed to save palette preference", e);
      }
    };
    savePalette();
  }, [palette, isLoading, isInitialized]);

  return { palette, setPalette: setPaletteState, isLoading };
}
