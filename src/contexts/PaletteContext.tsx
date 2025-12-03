import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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

function isValidPalette(value: string): value is PaletteType {
  return ["blue", "mint", "rose", "lavender", "peach", "red", "cyan"].includes(value);
}

interface PaletteContextType {
  palette: PaletteType;
  setPalette: (palette: PaletteType) => void;
  isLoading: boolean;
}

const PaletteContext = createContext<PaletteContextType | undefined>(undefined);

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteType>("blue");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Charger la palette au montage (une seule fois au démarrage de l'app)
  useEffect(() => {
    const loadPalette = async () => {
      try {
        console.log('[PaletteContext] Loading palette from storage...');
        const stored = await getNativeItem(PALETTE_STORAGE_KEY);
        console.log('[PaletteContext] Loaded from storage:', stored);

        if (stored && isValidPalette(stored)) {
          setPaletteState(stored);
          document.documentElement.setAttribute("data-palette", stored);
          console.log('[PaletteContext] Applied palette:', stored);
        } else {
          console.log('[PaletteContext] Invalid or missing palette, using default: blue');
          document.documentElement.setAttribute("data-palette", "blue");
        }
      } catch (error) {
        console.error("[PaletteContext] Failed to load palette", error);
        document.documentElement.setAttribute("data-palette", "blue");
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setIsInitialized(true);
          console.log('[PaletteContext] Initialization complete');
        }, 100);
      }
    };
    loadPalette();
  }, []);

  // Sauvegarder la palette à chaque changement (seulement après initialisation)
  useEffect(() => {
    if (isLoading || !isInitialized) {
      console.log('[PaletteContext] Skipping save - loading:', isLoading, 'initialized:', isInitialized);
      return;
    }

    const savePalette = async () => {
      try {
        console.log('[PaletteContext] Saving palette:', palette);
        await setNativeItem(PALETTE_STORAGE_KEY, palette);
        document.documentElement.setAttribute("data-palette", palette);
        console.log('[PaletteContext] Palette saved successfully');
      } catch (e) {
        console.error("[PaletteContext] Failed to save palette preference", e);
      }
    };
    savePalette();
  }, [palette, isLoading, isInitialized]);

  const setPalette = (newPalette: PaletteType) => {
    console.log('[PaletteContext] setPalette called with:', newPalette);
    setPaletteState(newPalette);
  };

  return (
    <PaletteContext.Provider value={{ palette, setPalette, isLoading }}>
      {children}
    </PaletteContext.Provider>
  );
}

export function usePalette() {
  const context = useContext(PaletteContext);
  if (context === undefined) {
    throw new Error("usePalette must be used within a PaletteProvider");
  }
  return context;
}
