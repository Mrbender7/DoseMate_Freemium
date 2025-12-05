import { useState, useEffect } from 'react';
import { 
  APP_EDITION, 
  CONVERSION_DELAY_MS, 
  STORAGE_KEYS 
} from '../config/freemium';

export function useConversionModal() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Ne pas afficher la modale en mode Premium
    if (APP_EDITION === 'PREMIUM') {
      return;
    }

    // Vérifier si l'utilisateur a déjà vu la modale
    const conversionSeen = localStorage.getItem(STORAGE_KEYS.CONVERSION_SEEN);
    if (conversionSeen === 'true') {
      return;
    }

    // Enregistrer la date de première utilisation si elle n'existe pas
    let firstUseDate = localStorage.getItem(STORAGE_KEYS.FIRST_USE_DATE);
    if (!firstUseDate) {
      firstUseDate = Date.now().toString();
      localStorage.setItem(STORAGE_KEYS.FIRST_USE_DATE, firstUseDate);
      console.log('[Freemium] First use date recorded:', new Date(parseInt(firstUseDate)));
    }

    // Calculer si 48h se sont écoulées
    const startTime = parseInt(firstUseDate, 10);
    const timeElapsed = Date.now() - startTime;

    console.log('[Freemium] Time elapsed:', Math.round(timeElapsed / 1000 / 60 / 60), 'hours');

    if (timeElapsed >= CONVERSION_DELAY_MS) {
      // Afficher la modale après un court délai pour ne pas interrompre le chargement
      const timeout = setTimeout(() => {
        setShowModal(true);
      }, 2000);

      return () => clearTimeout(timeout);
    } else {
      // Programmer l'affichage pour plus tard si l'utilisateur reste dans l'app
      const remainingTime = CONVERSION_DELAY_MS - timeElapsed;
      console.log('[Freemium] Modal will show in:', Math.round(remainingTime / 1000 / 60 / 60), 'hours');
      
      const timeout = setTimeout(() => {
        const seen = localStorage.getItem(STORAGE_KEYS.CONVERSION_SEEN);
        if (seen !== 'true') {
          setShowModal(true);
        }
      }, remainingTime);

      return () => clearTimeout(timeout);
    }
  }, []);

  const closeModal = () => {
    setShowModal(false);
    // Marquer comme vu pour ne plus afficher
    localStorage.setItem(STORAGE_KEYS.CONVERSION_SEEN, 'true');
    console.log('[Freemium] Conversion modal closed, marked as seen');
  };

  return {
    showModal,
    closeModal,
  };
}
