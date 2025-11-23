import { useEffect, useState } from "react";

export type PaletteType = "blue" | "mint" | "rose" | "lavender" | "peach" | "red";

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
} as const;

export function usePalette() {
  const [palette, setPaletteState] = useState<PaletteType>(() => {
    try {
      const stored = localStorage.getItem(PALETTE_STORAGE_KEY);
      return (stored as PaletteType) || "blue";
    } catch {
      return "blue";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, palette);
      document.documentElement.setAttribute("data-palette", palette);
    } catch (e) {
      console.warn("Failed to save palette preference", e);
    }
  }, [palette]);

  useEffect(() => {
    document.documentElement.setAttribute("data-palette", palette);
  }, []);

  return { palette, setPalette: setPaletteState };
}
