import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { authenticateUser, getFirebaseAuth } from '@/lib/firebase';

interface UseFirebaseAuthResult {
  user: User | null;
  userId: string | null;
  isLoading: boolean;
  error: Error | null;
}

export function useFirebaseAuth(): UseFirebaseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const auth = getFirebaseAuth();

        // Écouter les changements d'état d'authentification
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (!isMounted) return;

          if (currentUser) {
            setUser(currentUser);
            setIsLoading(false);
          } else {
            // Si pas d'utilisateur, tenter l'authentification
            try {
              const authenticatedUser = await authenticateUser();
              if (isMounted) {
                setUser(authenticatedUser);
              }
            } catch (authError) {
              if (isMounted) {
                setError(authError as Error);
              }
            } finally {
              if (isMounted) {
                setIsLoading(false);
              }
            }
          }
        });

        return () => {
          unsubscribe();
        };
      } catch (initError) {
        if (isMounted) {
          setError(initError as Error);
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    user,
    userId: user?.uid ?? null,
    isLoading,
    error
  };
}
