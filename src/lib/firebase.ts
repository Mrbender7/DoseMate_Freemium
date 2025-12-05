import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, Auth, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Déclaration des variables globales Canvas
declare global {
  interface Window {
    __firebase_config?: string;
    __initial_auth_token?: string;
  }
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Configuration Firebase par défaut (fallback)
const DEFAULT_CONFIG = {
  apiKey: "demo-api-key",
  authDomain: "demo.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000"
};

export function initializeFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } {
  if (app && auth && db) {
    return { app, auth, db };
  }

  // Récupérer la configuration depuis l'environnement Canvas ou utiliser la config par défaut
  let config = DEFAULT_CONFIG;
  
  if (typeof window !== 'undefined' && window.__firebase_config) {
    try {
      config = JSON.parse(window.__firebase_config);
      console.log('[Firebase] Using Canvas environment config');
    } catch (e) {
      console.warn('[Firebase] Failed to parse __firebase_config, using default');
    }
  }

  app = initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);

  console.log('[Firebase] Initialized with project:', config.projectId);

  return { app, auth, db };
}

export async function authenticateUser(): Promise<User | null> {
  const { auth } = initializeFirebase();

  try {
    // Si un token Canvas est disponible, l'utiliser
    if (typeof window !== 'undefined' && window.__initial_auth_token) {
      console.log('[Firebase] Authenticating with custom token');
      const result = await signInWithCustomToken(auth, window.__initial_auth_token);
      console.log('[Firebase] Authenticated with custom token, uid:', result.user.uid);
      return result.user;
    }

    // Sinon, authentification anonyme
    console.log('[Firebase] Authenticating anonymously');
    const result = await signInAnonymously(auth);
    console.log('[Firebase] Authenticated anonymously, uid:', result.user.uid);
    return result.user;
  } catch (error) {
    console.error('[Firebase] Authentication failed:', error);
    return null;
  }
}

export function getFirebaseAuth(): Auth {
  const { auth } = initializeFirebase();
  return auth;
}

export function getFirebaseDb(): Firestore {
  const { db } = initializeFirebase();
  return db;
}

export { app, auth, db };
