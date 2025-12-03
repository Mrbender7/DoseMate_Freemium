import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PaletteProvider } from "./contexts/PaletteContext";
import { ReinstallCleanupModal } from "./components/ReinstallCleanupModal";
import { useReinstallDetection } from "./hooks/use-reinstall-detection";
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

  // Affiche un écran de chargement pendant la vérification
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">...</div>
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
