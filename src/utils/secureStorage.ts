import { encrypt, decrypt } from './encryption';

/**
 * Wrapper sécurisé pour localStorage avec chiffrement automatique
 * Toutes les données sont chiffrées avant stockage et déchiffrées à la lecture
 */

/**
 * Stocke des données de manière sécurisée (chiffrées)
 * @param key - Clé de stockage
 * @param value - Valeur à stocker (sera automatiquement chiffrée)
 */
export function setSecureItem(key: string, value: string): void {
  try {
    const encryptedValue = encrypt(value);
    localStorage.setItem(key, encryptedValue);
  } catch (error) {
    console.error('Erreur lors du stockage sécurisé', error);
    throw error;
  }
}

/**
 * Récupère des données sécurisées (déchiffrées)
 * @param key - Clé de stockage
 * @returns Valeur déchiffrée ou null si inexistante
 */
export function getSecureItem(key: string): string | null {
  try {
    const encryptedValue = localStorage.getItem(key);
    
    if (!encryptedValue) {
      return null;
    }
    
    return decrypt(encryptedValue);
  } catch (error) {
    console.error('Erreur lors de la récupération sécurisée', error);
    return null;
  }
}

/**
 * Supprime un élément du stockage sécurisé
 * @param key - Clé de stockage
 */
export function removeSecureItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Erreur lors de la suppression', error);
  }
}

/**
 * Vérifie si une clé existe dans le stockage sécurisé
 * @param key - Clé de stockage
 */
export function hasSecureItem(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error('Erreur lors de la vérification', error);
    return false;
  }
}
