import { 
  doc, 
  setDoc, 
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';

// ID de l'application pour le namespace Firestore
const APP_ID = 'dosemate';

// Types de thèmes supportés
export type ThemeMode = 'light' | 'dark';
export type ThemePalette = 'blue' | 'mint' | 'rose' | 'lavender' | 'peach' | 'red' | 'cyan' | 'indigo';

export interface UserPreferences {
  theme: {
    mode: ThemeMode;
    palette: ThemePalette;
  };
  updatedAt: Date;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: {
    mode: 'dark',
    palette: 'blue'
  },
  updatedAt: new Date()
};

/**
 * Obtient le chemin du document de préférences pour un utilisateur
 */
function getPreferencesDocPath(userId: string): string {
  return `artifacts/${APP_ID}/users/${userId}/preferences/theme_data`;
}

/**
 * Met à jour les préférences de thème dans Firestore
 */
export async function updateThemePreference(
  userId: string, 
  mode: ThemeMode, 
  palette: ThemePalette
): Promise<void> {
  const db = getFirebaseDb();
  const docPath = getPreferencesDocPath(userId);
  
  console.log('[PreferencesService] Updating theme:', { mode, palette, docPath });
  
  await setDoc(doc(db, docPath), {
    theme: {
      mode,
      palette
    },
    updatedAt: new Date()
  }, { merge: true });
  
  console.log('[PreferencesService] Theme preference saved');
}

/**
 * Écoute les préférences utilisateur en temps réel
 */
export function subscribeToPreferences(
  userId: string,
  callback: (prefs: UserPreferences) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const docPath = getPreferencesDocPath(userId);
  
  console.log('[PreferencesService] Subscribing to preferences:', docPath);
  
  return onSnapshot(
    doc(db, docPath),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const prefs: UserPreferences = {
          theme: {
            mode: data.theme?.mode || DEFAULT_PREFERENCES.theme.mode,
            palette: data.theme?.palette || DEFAULT_PREFERENCES.theme.palette
          },
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        };
        console.log('[PreferencesService] Received preferences:', prefs);
        callback(prefs);
      } else {
        console.log('[PreferencesService] No preferences found, using defaults');
        callback(DEFAULT_PREFERENCES);
      }
    },
    (error) => {
      console.error('[PreferencesService] Subscription error:', error);
      if (onError) {
        onError(error);
      }
    }
  );
}
