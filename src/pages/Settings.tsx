import { useUserPreferences, ThemeMode, ThemePalette } from '@/hooks/use-user-preferences';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePalette, PALETTES, PaletteType } from '@/contexts/PaletteContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings as SettingsIcon, Sun, Moon, Palette, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

// Palettes disponibles avec leurs couleurs de prévisualisation
const PALETTE_PREVIEWS: Record<PaletteType, { bg: string; accent: string }> = {
  blue: { bg: 'bg-blue-900', accent: 'bg-blue-400' },
  mint: { bg: 'bg-emerald-900', accent: 'bg-emerald-400' },
  rose: { bg: 'bg-pink-900', accent: 'bg-pink-400' },
  lavender: { bg: 'bg-purple-900', accent: 'bg-purple-400' },
  peach: { bg: 'bg-orange-900', accent: 'bg-orange-400' },
  red: { bg: 'bg-red-900', accent: 'bg-red-400' },
  cyan: { bg: 'bg-cyan-900', accent: 'bg-cyan-400' },
};

export default function Settings() {
  const { t, language } = useLanguage();
  const { palette: currentPalette, setPalette, isLoading: isPaletteLoading } = usePalette();
  const { 
    preferences, 
    isLoading: isPrefsLoading, 
    error, 
    isAuthenticated, 
    updateTheme 
  } = useUserPreferences();
  
  const [selectedMode, setSelectedMode] = useState<ThemeMode>('dark');
  const [selectedPalette, setSelectedPalette] = useState<ThemePalette>(currentPalette);
  const [isSaving, setIsSaving] = useState(false);

  // Synchroniser avec les préférences Firebase
  useEffect(() => {
    if (!isPrefsLoading && isAuthenticated) {
      setSelectedMode(preferences.theme.mode);
      setSelectedPalette(preferences.theme.palette);
    }
  }, [preferences, isPrefsLoading, isAuthenticated]);

  // Synchroniser avec le contexte de palette local
  useEffect(() => {
    if (!isPaletteLoading) {
      setSelectedPalette(currentPalette);
    }
  }, [currentPalette, isPaletteLoading]);

  const handleModeChange = async (mode: ThemeMode) => {
    setSelectedMode(mode);
    
    // Appliquer immédiatement le mode
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    
    // Sauvegarder si authentifié
    if (isAuthenticated) {
      setIsSaving(true);
      try {
        await updateTheme(mode, selectedPalette);
      } catch (e) {
        console.error('Failed to save theme mode', e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handlePaletteChange = async (palette: PaletteType) => {
    setSelectedPalette(palette);
    setPalette(palette);
    
    // Sauvegarder si authentifié
    if (isAuthenticated) {
      setIsSaving(true);
      try {
        await updateTheme(selectedMode, palette);
      } catch (e) {
        console.error('Failed to save palette', e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (isPrefsLoading || isPaletteLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              {language === 'fr' ? 'Paramètres' : 'Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{language === 'fr' ? 'Erreur de chargement' : 'Loading error'}: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Mode Clair/Sombre */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {selectedMode === 'dark' ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-amber-500" />
            )}
            {language === 'fr' ? 'Mode d\'affichage' : 'Display Mode'}
          </CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Choisissez entre le mode clair et sombre'
              : 'Choose between light and dark mode'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedMode} 
            onValueChange={(v) => handleModeChange(v as ThemeMode)}
            className="grid grid-cols-2 gap-4"
          >
            <Label 
              htmlFor="mode-light" 
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                selectedMode === 'light' 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <RadioGroupItem value="light" id="mode-light" className="sr-only" />
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Sun className="h-6 w-6 text-amber-600" />
              </div>
              <span className="font-medium">{language === 'fr' ? 'Clair' : 'Light'}</span>
              {selectedMode === 'light' && (
                <Check className="h-4 w-4 text-primary absolute top-2 right-2" />
              )}
            </Label>
            
            <Label 
              htmlFor="mode-dark" 
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all relative",
                selectedMode === 'dark' 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <RadioGroupItem value="dark" id="mode-dark" className="sr-only" />
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                <Moon className="h-6 w-6 text-slate-300" />
              </div>
              <span className="font-medium">{language === 'fr' ? 'Sombre' : 'Dark'}</span>
              {selectedMode === 'dark' && (
                <Check className="h-4 w-4 text-primary absolute top-2 right-2" />
              )}
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Palette de couleurs */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-primary" />
            {language === 'fr' ? 'Palette de couleurs' : 'Color Palette'}
            {isSaving && (
              <span className="ml-auto text-xs text-muted-foreground animate-pulse">
                {language === 'fr' ? 'Sauvegarde...' : 'Saving...'}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Personnalisez l\'apparence de l\'application'
              : 'Customize the app appearance'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {(Object.keys(PALETTES) as PaletteType[]).map((paletteKey) => {
              const paletteInfo = PALETTES[paletteKey];
              const preview = PALETTE_PREVIEWS[paletteKey];
              const isSelected = selectedPalette === paletteKey;
              
              return (
                <button
                  key={paletteKey}
                  onClick={() => handlePaletteChange(paletteKey)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                    isSelected 
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30" 
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden",
                    preview.bg
                  )}>
                    <div className={cn(
                      "w-4 h-4 rounded-full",
                      preview.accent
                    )} />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium">{paletteInfo.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{paletteInfo.name}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Indicateur de synchronisation */}
      {isAuthenticated && (
        <Card className="bg-muted/30 border-muted">
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {language === 'fr' 
                ? 'Vos préférences sont synchronisées avec votre compte'
                : 'Your preferences are synced with your account'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
