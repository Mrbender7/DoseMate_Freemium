import { useCallback } from 'react';
import { toast } from 'sonner';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Hook pour afficher des alertes/toasts dans l'application mobile
 * Remplace les alert() natifs par des toasts shadcn/sonner
 */
export function useAppAlert() {
  const showAlert = useCallback((
    type: AlertType,
    message: string,
    options?: AlertOptions
  ) => {
    const toastOptions = {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      case 'info':
      default:
        toast.info(message, toastOptions);
        break;
    }
  }, []);

  const success = useCallback((message: string, options?: AlertOptions) => {
    showAlert('success', message, options);
  }, [showAlert]);

  const error = useCallback((message: string, options?: AlertOptions) => {
    showAlert('error', message, options);
  }, [showAlert]);

  const warning = useCallback((message: string, options?: AlertOptions) => {
    showAlert('warning', message, options);
  }, [showAlert]);

  const info = useCallback((message: string, options?: AlertOptions) => {
    showAlert('info', message, options);
  }, [showAlert]);

  // Remplace console.error par un toast pour les erreurs critiques
  const logError = useCallback((errorMessage: string, errorDetails?: unknown) => {
    console.error('[DoseMate Error]', errorMessage, errorDetails);
    showAlert('error', errorMessage, {
      description: errorDetails ? String(errorDetails) : undefined,
      duration: 5000,
    });
  }, [showAlert]);

  return {
    showAlert,
    success,
    error,
    warning,
    info,
    logError,
  };
}

// Export aussi une version standalone pour usage hors composant
export const appAlert = {
  success: (message: string, options?: AlertOptions) => {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
    });
  },
  error: (message: string, options?: AlertOptions) => {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration ?? 5000,
    });
  },
  warning: (message: string, options?: AlertOptions) => {
    toast.warning(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
    });
  },
  info: (message: string, options?: AlertOptions) => {
    toast.info(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
    });
  },
};
