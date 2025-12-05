import { useState, useEffect, useCallback } from 'react';
import { useFirebaseAuth } from './use-firebase-auth';
import { 
  subscribeToPreferences, 
  updateThemePreference,
  UserPreferences, 
  DEFAULT_PREFERENCES,
  ThemeMode,
  ThemePalette
} from '@/services/preferencesService';

interface UseUserPreferencesResult {
  preferences: UserPreferences;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  updateTheme: (mode: ThemeMode, palette: ThemePalette) => Promise<void>;
}

export function useUserPreferences(): UseUserPreferencesResult {
  const { userId, isLoading: isAuthLoading, error: authError } = useFirebaseAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;
    
    if (!userId) {
      setIsLoading(false);
      if (authError) {
        setError(authError);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    // S'abonner aux préférences en temps réel
    const unsubscribe = subscribeToPreferences(
      userId,
      (prefs) => {
        setPreferences(prefs);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId, isAuthLoading, authError]);

  const updateTheme = useCallback(async (mode: ThemeMode, palette: ThemePalette): Promise<void> => {
    if (!userId) {
      console.error('[useUserPreferences] Cannot update theme: not authenticated');
      return;
    }

    try {
      await updateThemePreference(userId, mode, palette);
      // La mise à jour locale sera faite via le listener onSnapshot
    } catch (err) {
      console.error('[useUserPreferences] Failed to update theme:', err);
      setError(err as Error);
      throw err;
    }
  }, [userId]);

  return {
    preferences,
    isLoading: isAuthLoading || isLoading,
    error,
    isAuthenticated: !!userId,
    updateTheme
  };
}

export type { ThemeMode, ThemePalette };
