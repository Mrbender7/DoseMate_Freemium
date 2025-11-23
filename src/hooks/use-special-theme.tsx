import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SpecialThemeType = 'normal' | 'christmas' | 'halloween';

interface SpecialThemeStore {
  theme: SpecialThemeType;
  setTheme: (theme: SpecialThemeType) => void;
}

export const useSpecialTheme = create<SpecialThemeStore>()(
  persist(
    (set) => ({
      theme: 'normal',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-special-theme', theme);
      },
    }),
    {
      name: 'special-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute('data-special-theme', state.theme);
        }
      },
    }
  )
);

export const SPECIAL_THEMES = {
  normal: { name: 'Normal', emoji: '✨' },
  christmas: { name: 'Noël', emoji: '🎄' },
  halloween: { name: 'Halloween', emoji: '🎃' },
} as const;
