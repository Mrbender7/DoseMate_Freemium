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

export function usePalette() {
  const [palette, setPaletteState] = useState<PaletteType>("blue");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Charger la palette au montage
  useEffect(() => {
    const loadPalette = async () => {
      try {
        const stored = await getNativeItem(PALETTE_STORAGE_KEY);
        if (stored) {
          setPaletteState(stored as PaletteType);
          document.documentElement.setAttribute("data-palette", stored);
        } else {
          document.documentElement.setAttribute("data-palette", "blue");
        }
      } catch (error) {
        console.error("Failed to load palette", error);
        document.documentElement.setAttribute("data-palette", "blue");
      } finally {
        setIsLoading(false);
      }
    };
    loadPalette();
  }, []);

  // Sauvegarder la palette à chaque changement
  useEffect(() => {
    if (!isLoading) {
      const savePalette = async () => {
        try {
          await setNativeItem(PALETTE_STORAGE_KEY, palette);
          document.documentElement.setAttribute("data-palette", palette);
        } catch (e) {
          console.warn("Failed to save palette preference", e);
        }
      };
      savePalette();
    }
  }, [palette, isLoading]);

  return { palette, setPalette: setPaletteState, isLoading };
}
