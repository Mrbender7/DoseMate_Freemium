import CryptoJS from 'crypto-js';
import { Preferences } from '@capacitor/preferences';

/**
 * Système de chiffrement local pour DoseMate
 * Utilise AES-256 pour chiffrer les données sensibles
 * Optimisé pour Capacitor avec Preferences API
 */

const ENCRYPTION_KEY_STORAGE = '__gf_ek__';
const KEY_LENGTH = 32; // 256 bits pour AES-256

/**
 * Génère une clé de chiffrement aléatoire sécurisée
 */
function generateEncryptionKey(): string {
  const randomBytes = CryptoJS.lib.WordArray.random(KEY_LENGTH);
  return CryptoJS.enc.Base64.stringify(randomBytes);
}

/**
 * Récupère ou crée la clé de chiffrement de manière asynchrone
 * La clé est générée au premier lancement et stockée dans Capacitor Preferences
 */
async function getEncryptionKey(): Promise<string> {
  try {
    const { value: key } = await Preferences.get({ key: ENCRYPTION_KEY_STORAGE });
    
    if (!key) {
      // Première utilisation : générer une nouvelle clé
      const newKey = generateEncryptionKey();
      await Preferences.set({ 
        key: ENCRYPTION_KEY_STORAGE, 
        value: newKey 
      });
      return newKey;
    }
    
    return key;
  } catch (error) {
    console.error('Erreur lors de la récupération de la clé de chiffrement', error);
    // Fallback : générer une clé temporaire en mémoire
    return generateEncryptionKey();
  }
}

/**
 * Chiffre une chaîne de caractères avec AES-256 (asynchrone)
 * @param data - Données à chiffrer
 * @returns Données chiffrées en Base64
 */
export async function encryptAsync(data: string): Promise<string> {
  if (!data) return data;

  try {
    const key = await getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(data, key);
    const result = encrypted.toString();
    console.log('[Encryption] Data encrypted, length:', result.length);
    return result;
  } catch (error) {
    console.error('[Encryption] Encryption error:', error);
    // En cas d'erreur, retourner les données non chiffrées pour éviter la perte de données
    return data;
  }
}

/**
 * Déchiffre une chaîne chiffrée (asynchrone)
 * @param encryptedData - Données chiffrées
 * @returns Données déchiffrées
 */
export async function decryptAsync(encryptedData: string): Promise<string> {
  if (!encryptedData) return encryptedData;

  try {
    const key = await getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

    // Si le déchiffrement échoue, retourner les données originales
    // (cas où les données n'étaient pas chiffrées)
    if (decryptedString) {
      console.log('[Encryption] Data decrypted successfully, length:', decryptedString.length);
      return decryptedString;
    } else {
      console.warn('[Encryption] Decryption returned empty, returning original data');
      return encryptedData;
    }
  } catch (error) {
    console.error('[Encryption] Decryption error:', error);
    // Retourner les données originales en cas d'erreur
    return encryptedData;
  }
}

// Exports de compatibilité synchrone (à éviter si possible)
// Ces fonctions utilisent une clé en cache en mémoire
let cachedKey: string | null = null;

/**
 * Initialise la clé de chiffrement en cache (à appeler au démarrage)
 */
export async function initEncryption(): Promise<void> {
  cachedKey = await getEncryptionKey();
}

/**
 * Chiffre une chaîne de caractères avec AES-256 (synchrone, utilise le cache)
 * @deprecated Préférer encryptAsync pour une meilleure sécurité
 */
export function encrypt(data: string): string {
  if (!data) return data;
  
  try {
    const key = cachedKey || generateEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(data, key);
    return encrypted.toString();
  } catch (error) {
    console.error('Erreur de chiffrement', error);
    return data;
  }
}

/**
 * Déchiffre une chaîne chiffrée (synchrone, utilise le cache)
 * @deprecated Préférer decryptAsync pour une meilleure sécurité
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return encryptedData;
  
  try {
    const key = cachedKey || generateEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    return decryptedString || encryptedData;
  } catch (error) {
    console.error('Erreur de déchiffrement', error);
    return encryptedData;
  }
}
