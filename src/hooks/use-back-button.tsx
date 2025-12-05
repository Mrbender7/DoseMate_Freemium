import { useEffect, useCallback, useState } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useLocation, useNavigate } from 'react-router-dom';

interface UseBackButtonOptions {
  onExitConfirm?: () => void;
}

/**
 * Hook pour gérer le bouton de retour Android
 * - Sur la page principale (/), demande confirmation avant de quitter
 * - Sur les autres pages, navigue vers la page précédente
 */
export function useBackButton(options?: UseBackButtonOptions) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [lastBackPress, setLastBackPress] = useState(0);

  const handleBackButton = useCallback(() => {
    const isMainPage = location.pathname === '/';
    
    if (isMainPage) {
      // Sur la page principale, demander confirmation
      const now = Date.now();
      
      // Double tap pour quitter (dans les 2 secondes)
      if (now - lastBackPress < 2000) {
        App.exitApp();
        return;
      }
      
      setLastBackPress(now);
      setShowExitDialog(true);
      
      // Masquer le dialog après 2 secondes si pas d'action
      setTimeout(() => {
        setShowExitDialog(false);
      }, 2000);
    } else {
      // Sur les autres pages, revenir en arrière
      navigate(-1);
    }
  }, [location.pathname, navigate, lastBackPress]);

  const confirmExit = useCallback(() => {
    options?.onExitConfirm?.();
    App.exitApp();
  }, [options]);

  const cancelExit = useCallback(() => {
    setShowExitDialog(false);
  }, []);

  useEffect(() => {
    // Ne s'applique que sur les plateformes natives
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
      handleBackButton();
    });

    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, [handleBackButton]);

  return {
    showExitDialog,
    confirmExit,
    cancelExit,
  };
}
