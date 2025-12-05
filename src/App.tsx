import { useEffect, useState } from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PaletteProvider, usePalette } from "./contexts/PaletteContext";
import { ReinstallCleanupModal } from "./components/ReinstallCleanupModal";
import { ConversionModal } from "./components/ConversionModal";
import { ExitConfirmDialog } from "./components/ExitConfirmDialog";
import { useReinstallDetection } from "./hooks/use-reinstall-detection";
import { useConversionModal } from "./hooks/use-conversion-modal";
import { useBackButton } from "./hooks/use-back-button";
import { SplashScreen } from "@capacitor/splash-screen";
import { Capacitor } from "@capacitor/core";
import Index from "./pages/Index";
import History from "./pages/History";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import dosemateLogo from "./assets/dosemate-logo.png";

const queryClient = new QueryClient();

// Composant séparé pour le contenu avec le router (nécessaire pour useBackButton)
function AppRoutes() {
  const { showExitDialog, confirmExit, cancelExit } = useBackButton();

  return (
    <>
      <ExitConfirmDialog
        open={showExitDialog}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function AppContent() {
  const {
    showCleanupModal,
    isChecking,
    isCleaningUp,
    cleanupResidualData,
    keepResidualData,
  } = useReinstallDetection();
  
  const { showModal: showConversionModal, closeModal: closeConversionModal } = useConversionModal();
  const { isLoading: isPaletteLoading } = usePalette();
  const [splashHidden, setSplashHidden] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [themeInitialized, setThemeInitialized] = useState(false);

  // Initialiser le thème immédiatement au montage pour éviter le flash
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Forcer le mode sombre par défaut si aucun thème n'est défini
        if (!document.documentElement.classList.contains('dark') && 
            !document.documentElement.classList.contains('light')) {
          document.documentElement.classList.add('dark');
        }
        
        console.log('[App] Theme initialized');
      } catch (error) {
        console.warn('[App] Theme initialization error:', error);
        document.documentElement.classList.add('dark');
      } finally {
        setThemeInitialized(true);
      }
    };
    
    initializeTheme();
  }, []);

  // Masquer le splash screen avec fondu de sécurité
  useEffect(() => {
    const hideSplash = async () => {
      if (!isChecking && !isPaletteLoading && !splashHidden) {
        try {
          console.log('[App] All contexts loaded, preparing splash hide...');
          
          // Fondu de sécurité
          await new Promise(resolve => setTimeout(resolve, 800));
          
          if (Capacitor.isNativePlatform()) {
            console.log('[App] Native platform detected, hiding splash screen...');
            await SplashScreen.hide({ fadeOutDuration: 300 });
          }
          
          setSplashHidden(true);
          console.log('[App] Splash screen hidden');
          
          setTimeout(() => {
            setIsAppReady(true);
            console.log('[App] App ready, interface visible');
          }, 200);
          
        } catch (error) {
          console.log('[App] Splash screen hide failed (likely running in web):', error);
          setSplashHidden(true);
          setIsAppReady(true);
        }
      }
    };
    
    hideSplash();
  }, [isChecking, isPaletteLoading, splashHidden]);

  // Afficher un fond sombre avec logo animé pendant le chargement
  if (isChecking || isPaletteLoading || !splashHidden || !isAppReady || !themeInitialized) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center gap-6">
        <img 
          src={dosemateLogo} 
          alt="DoseMate" 
          className="w-32 h-32 animate-pulse drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]"
        />
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
        </div>
      </div>
    );
  }

  return (
    <>
      <ReinstallCleanupModal
        open={showCleanupModal}
        onCleanup={cleanupResidualData}
        onKeep={keepResidualData}
        isCleaningUp={isCleaningUp}
      />
      <ConversionModal
        open={showConversionModal}
        onClose={closeConversionModal}
      />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <PaletteProvider>
        <AppContent />
      </PaletteProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
