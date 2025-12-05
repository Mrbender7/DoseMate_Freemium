import { useUserPreferences, ThemeMode, ThemePalette } from '@/hooks/use-user-preferences';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePalette, PALETTES, PaletteType } from '@/contexts/PaletteContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings as SettingsIcon, Sun, Moon, Palette, AlertCircle, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

// Configuration des palettes avec couleurs réelles
const PALETTE_CONFIG: Record<PaletteType, { 
  name: string;
  emoji: string;
  primary: string;
  secondary: string;
  gradient: string;
}> = {
  blue: { 
    name: 'Ocean',
    emoji: '🌊',
    primary: 'bg-blue-500',
    secondary: 'bg-blue-300',
    gradient: 'from-blue-600 to-blue-400'
  },
  mint: { 
    name: 'Menthe',
    emoji: '🍃',
    primary: 'bg-emerald-500',
    secondary: 'bg-emerald-300',
    gradient: 'from-emerald-600 to-emerald-400'
  },
  rose: { 
    name: 'Rose',
    emoji: '🌸',
    primary: 'bg-pink-500',
    secondary: 'bg-pink-300',
    gradient: 'from-pink-600 to-pink-400'
  },
  lavender: { 
    name: 'Lavande',
    emoji: '💜',
    primary: 'bg-purple-500',
    secondary: 'bg-purple-300',
    gradient: 'from-purple-600 to-purple-400'
  },
  peach: { 
    name: 'Pêche',
    emoji: '🍑',
    primary: 'bg-orange-500',
    secondary: 'bg-orange-300',
    gradient: 'from-orange-600 to-orange-400'
  },
  red: { 
    name: 'Ruby',
    emoji: '❤️',
    primary: 'bg-red-500',
    secondary: 'bg-red-300',
    gradient: 'from-red-600 to-red-400'
  },
  cyan: { 
    name: 'Cyan',
    emoji: '💎',
    primary: 'bg-cyan-500',
    secondary: 'bg-cyan-300',
    gradient: 'from-cyan-600 to-cyan-400'
  },
};

export default function Settings() {
  const { language } = useLanguage();
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
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
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
      {/* En-tête */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            {language === 'fr' ? 'Personnalisation' : 'Customization'}
          </CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? "Personnalisez l'apparence de votre application"
              : 'Customize your app appearance'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Mode Clair/Sombre */}
      <Card className="border-primary/20 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {selectedMode === 'dark' ? (
              <Moon className="h-4 w-4 text-indigo-400" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
            {language === 'fr' ? "Mode d'affichage" : 'Display Mode'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Mode Clair */}
            <button
              onClick={() => handleModeChange('light')}
              className={cn(
                "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300",
                "hover:scale-[1.02] active:scale-[0.98]",
                selectedMode === 'light' 
                  ? "border-primary bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 shadow-lg shadow-primary/10" 
                  : "border-border/50 hover:border-primary/30 bg-card/50"
              )}
            >
              {/* Aperçu visuel du mode clair */}
              <div className="w-full aspect-[4/3] rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-2 relative overflow-hidden">
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 shadow-lg" />
                <div className="h-2 w-3/4 rounded bg-slate-300 mb-1.5" />
                <div className="h-2 w-1/2 rounded bg-slate-200" />
                <div className="absolute bottom-2 left-2 right-2 h-4 rounded bg-blue-500/80" />
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-amber-500" />
                <span className="font-medium">{language === 'fr' ? 'Clair' : 'Light'}</span>
              </div>
              {selectedMode === 'light' && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </button>

            {/* Mode Sombre */}
            <button
              onClick={() => handleModeChange('dark')}
              className={cn(
                "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300",
                "hover:scale-[1.02] active:scale-[0.98]",
                selectedMode === 'dark' 
                  ? "border-primary bg-gradient-to-br from-slate-900/50 to-indigo-900/30 shadow-lg shadow-primary/10" 
                  : "border-border/50 hover:border-primary/30 bg-card/50"
              )}
            >
              {/* Aperçu visuel du mode sombre */}
              <div className="w-full aspect-[4/3] rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-2 relative overflow-hidden">
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg opacity-80" />
                <div className="h-2 w-3/4 rounded bg-slate-600 mb-1.5" />
                <div className="h-2 w-1/2 rounded bg-slate-700" />
                <div className="absolute bottom-2 left-2 right-2 h-4 rounded bg-blue-500/80" />
              </div>
              <div className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-indigo-400" />
                <span className="font-medium">{language === 'fr' ? 'Sombre' : 'Dark'}</span>
              </div>
              {selectedMode === 'dark' && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Palette de couleurs */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4 text-primary" />
            {language === 'fr' ? 'Palette de couleurs' : 'Color Palette'}
            {isSaving && (
              <span className="ml-auto text-xs text-muted-foreground animate-pulse">
                {language === 'fr' ? 'Sauvegarde...' : 'Saving...'}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Choisissez votre couleur d\'accent préférée'
              : 'Choose your preferred accent color'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(Object.keys(PALETTE_CONFIG) as PaletteType[]).map((paletteKey, index) => {
              const config = PALETTE_CONFIG[paletteKey];
              const isSelected = selectedPalette === paletteKey;
              
              return (
                <button
                  key={paletteKey}
                  onClick={() => handlePaletteChange(paletteKey)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    "animate-fade-in",
                    isSelected 
                      ? "border-primary shadow-lg shadow-primary/20" 
                      : "border-border/50 hover:border-primary/30"
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* Aperçu de la palette avec gradient */}
                  <div className={cn(
                    "w-full aspect-square rounded-lg bg-gradient-to-br overflow-hidden relative",
                    config.gradient
                  )}>
                    {/* Effet de brillance */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0" />
                    
                    {/* Cercles décoratifs */}
                    <div className={cn(
                      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full opacity-50",
                      config.secondary
                    )} />
                    <div className={cn(
                      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full",
                      "bg-white/80"
                    )} />

                    {/* Checkmark pour la sélection */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nom et emoji */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{config.emoji}</span>
                    <span className="text-sm font-medium">{config.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Indicateur de synchronisation */}
      {isAuthenticated && (
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="py-3">
            <p className="text-xs text-center flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-green-700 dark:text-green-400">
                {language === 'fr' 
                  ? 'Vos préférences sont synchronisées'
                  : 'Your preferences are synced'}
              </span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
