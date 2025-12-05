import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  deleteDoc,
  doc,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import type { HistoryEntry } from '@/types/insulin';

// ID de l'application pour le namespace Firestore
const APP_ID = 'dosemate';

// Interface pour les données de dose stockées dans Firestore
export interface FirestoreDose {
  id?: string;
  dateISO: string;
  display: string;
  glycemia?: number;
  base?: number | null;
  meal?: number | null;
  totalAdministered: number;
  totalCalculated: number;
  moment: string;
  createdAt: Timestamp;
}

/**
 * Obtient le chemin de la collection des doses pour un utilisateur
 */
function getDosesCollectionPath(userId: string): string {
  return `artifacts/${APP_ID}/users/${userId}/doses`;
}

/**
 * Sauvegarde une dose dans Firestore
 */
export async function saveDose(userId: string, doseData: Omit<HistoryEntry, 'id'>): Promise<string> {
  const db = getFirebaseDb();
  const collectionPath = getDosesCollectionPath(userId);
  
  const firestoreData: Omit<FirestoreDose, 'id'> = {
    dateISO: doseData.dateISO,
    display: doseData.display,
    glycemia: doseData.glycemia,
    base: doseData.base,
    meal: doseData.meal,
    totalAdministered: doseData.totalAdministered,
    totalCalculated: doseData.totalCalculated,
    moment: doseData.moment,
    createdAt: Timestamp.now()
  };

  console.log('[DoseService] Saving dose to:', collectionPath);
  
  const docRef = await addDoc(collection(db, collectionPath), firestoreData);
  console.log('[DoseService] Dose saved with ID:', docRef.id);
  
  return docRef.id;
}

/**
 * Supprime une dose de Firestore
 */
export async function deleteDose(userId: string, doseId: string): Promise<void> {
  const db = getFirebaseDb();
  const collectionPath = getDosesCollectionPath(userId);
  
  console.log('[DoseService] Deleting dose:', doseId);
  await deleteDoc(doc(db, collectionPath, doseId));
  console.log('[DoseService] Dose deleted');
}

/**
 * Écoute l'historique des doses en temps réel
 */
export function subscribeToDoseHistory(
  userId: string, 
  callback: (doses: HistoryEntry[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const collectionPath = getDosesCollectionPath(userId);
  
  console.log('[DoseService] Subscribing to dose history:', collectionPath);
  
  const q = query(
    collection(db, collectionPath),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const doses: HistoryEntry[] = snapshot.docs.map((doc) => {
        const data = doc.data() as FirestoreDose;
        return {
          id: doc.id,
          dateISO: data.dateISO,
          display: data.display,
          glycemia: data.glycemia,
          base: data.base,
          meal: data.meal,
          totalAdministered: data.totalAdministered,
          totalCalculated: data.totalCalculated,
          moment: data.moment as HistoryEntry['moment']
        };
      });
      
      console.log('[DoseService] Received', doses.length, 'doses');
      callback(doses);
    },
    (error) => {
      console.error('[DoseService] Subscription error:', error);
      if (onError) {
        onError(error);
      }
    }
  );
}
