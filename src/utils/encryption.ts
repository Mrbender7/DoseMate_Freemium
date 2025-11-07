import CryptoJS from 'crypto-js';

/**
 * Système de chiffrement local pour GlucoFlow
 * Utilise AES-256 pour chiffrer les données sensibles
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
 * Récupère ou crée la clé de chiffrement
 * La clé est générée au premier lancement et stockée de manière sécurisée
 */
function getEncryptionKey(): string {
  try {
    let key = localStorage.getItem(ENCRYPTION_KEY_STORAGE);
    
    if (!key) {
      // Première utilisation : générer une nouvelle clé
      key = generateEncryptionKey();
      localStorage.setItem(ENCRYPTION_KEY_STORAGE, key);
    }
    
    return key;
  } catch (error) {
    console.error('Erreur lors de la récupération de la clé de chiffrement', error);
    // Fallback : générer une clé temporaire en mémoire
    return generateEncryptionKey();
  }
}

/**
 * Chiffre une chaîne de caractères avec AES-256
 * @param data - Données à chiffrer
 * @returns Données chiffrées en Base64
 */
export function encrypt(data: string): string {
  if (!data) return data;
  
  try {
    const key = getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(data, key);
    return encrypted.toString();
  } catch (error) {
    console.error('Erreur de chiffrement', error);
    // En cas d'erreur, retourner les données non chiffrées pour éviter la perte de données
    return data;
  }
}

/**
 * Déchiffre une chaîne chiffrée
 * @param encryptedData - Données chiffrées
 * @returns Données déchiffrées
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return encryptedData;
  
  try {
    const key = getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    // Si le déchiffrement échoue, retourner les données originales
    // (cas où les données n'étaient pas chiffrées)
    return decryptedString || encryptedData;
  } catch (error) {
    console.error('Erreur de déchiffrement', error);
    // Retourner les données originales en cas d'erreur
    return encryptedData;
  }
}
