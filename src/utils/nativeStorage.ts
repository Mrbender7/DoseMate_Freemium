import { Preferences } from '@capacitor/preferences';
import { encryptAsync, decryptAsync } from './encryption';

/**
 * Wrapper sécurisé pour Capacitor Preferences avec chiffrement automatique
 * Optimisé pour les applications natives (Android/iOS) et web
 * Toutes les données sont chiffrées avant stockage et déchiffrées à la lecture
 */

/**
 * Stocke des données de manière sécurisée (chiffrées) en utilisant Capacitor Preferences
 * @param key - Clé de stockage
 * @param value - Valeur à stocker (sera automatiquement chiffrée)
 */
export async function setNativeItem(key: string, value: string): Promise<void> {
  try {
    const encryptedValue = await encryptAsync(value);
    await Preferences.set({ key, value: encryptedValue });
  } catch (error) {
    console.error('Erreur lors du stockage sécurisé natif', error);
    throw error;
  }
}

/**
 * Récupère des données sécurisées (déchiffrées) depuis Capacitor Preferences
 * @param key - Clé de stockage
 * @returns Valeur déchiffrée ou null si inexistante
 */
export async function getNativeItem(key: string): Promise<string | null> {
  try {
    const { value: encryptedValue } = await Preferences.get({ key });
    
    if (!encryptedValue) {
      return null;
    }
    
    return await decryptAsync(encryptedValue);
  } catch (error) {
    console.error('Erreur lors de la récupération sécurisée native', error);
    return null;
  }
}

/**
 * Supprime un élément du stockage sécurisé natif
 * @param key - Clé de stockage
 */
export async function removeNativeItem(key: string): Promise<void> {
  try {
    await Preferences.remove({ key });
  } catch (error) {
    console.error('Erreur lors de la suppression native', error);
  }
}

/**
 * Vérifie si une clé existe dans le stockage sécurisé natif
 * @param key - Clé de stockage
 */
export async function hasNativeItem(key: string): Promise<boolean> {
  try {
    const { value } = await Preferences.get({ key });
    return value !== null;
  } catch (error) {
    console.error('Erreur lors de la vérification native', error);
    return false;
  }
}

/**
 * Efface toutes les données du stockage sécurisé natif
 */
export async function clearNativeStorage(): Promise<void> {
  try {
    await Preferences.clear();
  } catch (error) {
    console.error('Erreur lors de l\'effacement du stockage natif', error);
  }
}
