// Configuration Freemium pour DoseMate

// Édition de l'application : 'FREE' ou 'PREMIUM'
export const APP_EDITION: 'FREE' | 'PREMIUM' = 'FREE';

// Durée avant affichage de la modale de conversion (48 heures en ms)
export const CONVERSION_DELAY_MS = 48 * 60 * 60 * 1000;

// Clés localStorage
export const STORAGE_KEYS = {
  FIRST_USE_DATE: 'dosemate_first_use_date',
  CONVERSION_SEEN: 'dosemate_conversion_seen',
} as const;

// URL de l'application Premium (à personnaliser)
export const PREMIUM_URL = 'https://dosemate.app/premium';

// Fonctionnalités Premium
export const PREMIUM_FEATURES = {
  HISTORY: 'history',
  THEMES: 'themes',
  DARK_MODE: 'darkMode',
} as const;

// Helper pour vérifier si une fonctionnalité est disponible
export function isFeatureAvailable(feature: keyof typeof PREMIUM_FEATURES): boolean {
  return APP_EDITION === 'PREMIUM';
}

// Helper pour vérifier si l'édition est Premium
export function isPremium(): boolean {
  return APP_EDITION === 'PREMIUM';
}
