import { useState, useEffect } from 'react';
import { useFirebaseAuth } from './use-firebase-auth';
import { subscribeToDoseHistory, saveDose, deleteDose } from '@/services/doseService';
import type { HistoryEntry } from '@/types/insulin';

interface UseDoseHistoryResult {
  history: HistoryEntry[];
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  addDose: (dose: Omit<HistoryEntry, 'id'>) => Promise<string | null>;
  removeDose: (doseId: string) => Promise<void>;
}

export function useDoseHistory(): UseDoseHistoryResult {
  const { userId, isLoading: isAuthLoading, error: authError } = useFirebaseAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
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

    // S'abonner à l'historique en temps réel
    const unsubscribe = subscribeToDoseHistory(
      userId,
      (doses) => {
        setHistory(doses);
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

  const addDose = async (dose: Omit<HistoryEntry, 'id'>): Promise<string | null> => {
    if (!userId) {
      console.error('[useDoseHistory] Cannot add dose: not authenticated');
      return null;
    }

    try {
      const id = await saveDose(userId, dose);
      return id;
    } catch (err) {
      console.error('[useDoseHistory] Failed to add dose:', err);
      setError(err as Error);
      return null;
    }
  };

  const removeDose = async (doseId: string): Promise<void> => {
    if (!userId) {
      console.error('[useDoseHistory] Cannot delete dose: not authenticated');
      return;
    }

    try {
      await deleteDose(userId, doseId);
    } catch (err) {
      console.error('[useDoseHistory] Failed to delete dose:', err);
      setError(err as Error);
    }
  };

  return {
    history,
    isLoading: isAuthLoading || isLoading,
    error,
    isAuthenticated: !!userId,
    addDose,
    removeDose
  };
}
