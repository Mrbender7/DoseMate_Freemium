import { useEffect, useState } from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PaletteProvider, usePalette } from "./contexts/PaletteContext";
import { ReinstallCleanupModal } from "./components/ReinstallCleanupModal";
import { useReinstallDetection } from "./hooks/use-reinstall-detection";
import { SplashScreen } from "@capacitor/splash-screen";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const {
    showCleanupModal,
    isChecking,
    isCleaningUp,
    cleanupResidualData,
    keepResidualData,
  } = useReinstallDetection();
  
  const { isLoading: isPaletteLoading } = usePalette();
  const [splashHidden, setSplashHidden] = useState(false);

  // Masquer le splash screen uniquement quand tous les contextes sont chargés
  useEffect(() => {
    const hideSplash = async () => {
      // Attendre que les contextes critiques soient chargés
      if (!isChecking && !isPaletteLoading && !splashHidden) {
        try {
          console.log('[App] All contexts loaded, hiding splash screen...');
          await SplashScreen.hide();
          setSplashHidden(true);
          console.log('[App] Splash screen hidden');
        } catch (error) {
          // En cas d'erreur (web), on masque quand même l'état de chargement
          console.log('[App] Splash screen hide failed (likely running in web):', error);
          setSplashHidden(true);
        }
      }
    };
    
    hideSplash();
  }, [isChecking, isPaletteLoading, splashHidden]);

  // Ne rien afficher tant que les contextes critiques ne sont pas chargés
  if (isChecking || isPaletteLoading || !splashHidden) {
    return null;
  }

  return (
    <>
      <ReinstallCleanupModal
        open={showCleanupModal}
        onCleanup={cleanupResidualData}
        onKeep={keepResidualData}
        isCleaningUp={isCleaningUp}
      />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
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
