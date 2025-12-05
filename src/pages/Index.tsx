import { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Sun, Moon, ArrowUp, AlertTriangle, Lock, Crown, Settings, Palette, Check } from "lucide-react";
import { PaletteSelector } from "../components/PaletteSelector";
import { LanguageToggle } from "../components/LanguageToggle";
import { PremiumBadge } from "../components/PremiumBadge";
import { isPremium, PREMIUM_URL } from "../config/freemium";
import { SteampunkClock } from "../components/ui/clock";
import { GlycemiaCard } from "../components/insulin/GlycemiaCard";
import { MealCard } from "../components/insulin/MealCard";
import { ExpertSettingsTable } from "../components/insulin/ExpertSettingsTable";
import { MealParametersSettings } from "../components/insulin/MealParametersSettings";
import { SettingsFooter } from "../components/insulin/SettingsFooter";
import { ResultCard } from "../components/insulin/ResultCard";
import { HistoryCard } from "../components/insulin/HistoryCard";
import { OnboardingModal } from "../components/OnboardingModal";
import { uid, parseNumberInput, nowISO, getMomentOfDay } from "../utils/calculations";
import { useDoseHistory } from "../hooks/use-dose-history";
import { useUserPreferences, ThemeMode, ThemePalette } from "../hooks/use-user-preferences";
import { cn } from "../lib/utils";

import { getNativeItem, setNativeItem, removeNativeItem } from "../utils/nativeStorage";
import { useLanguage } from "../contexts/LanguageContext";
import { usePalette, PALETTES, PaletteType } from "../contexts/PaletteContext";
import { useOnboarding } from "../hooks/use-onboarding";
import dosemateLogo from "../assets/dosemate-logo.png";
import type { 
  FoodItem, 
  HistoryEntry, 
  MomentKey, 
  DoseRange
} from "../types/insulin";
import {
  STORAGE_KEY,
  STORAGE_META_KEY,
  STORAGE_CUSTOM_TABLE_KEY,
  DEFAULT_CARB_RATIO,
  DISPLAY_MAX,
  MAX_CALCULATED,
  DEFAULT_INSULIN_TABLE,
} from "../types/insulin";

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

interface SettingsTabContentProps {
  darkMode: boolean;
  setDarkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  palette: PaletteType;
  setPalette: (palette: PaletteType) => void;
  isPrefsAuth: boolean;
  updateTheme: (mode: ThemeMode, palette: ThemePalette) => Promise<void>;
  language: string;
  showToast: (text: string) => void;
}

function SettingsTabContent({
  darkMode,
  setDarkMode,
  palette,
  setPalette,
  isPrefsAuth,
  updateTheme,
  language,
  showToast
}: SettingsTabContentProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleModeChange = async (isDark: boolean) => {
    setDarkMode(isDark);
    
    // Sauvegarder si authentifié
    if (isPrefsAuth) {
      setIsSaving(true);
      try {
        await updateTheme(isDark ? 'dark' : 'light', palette);
      } catch (e) {
        console.error('Failed to save theme mode', e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handlePaletteChange = async (newPalette: PaletteType) => {
    setPalette(newPalette);
    
    // Sauvegarder si authentifié
    if (isPrefsAuth) {
      setIsSaving(true);
      try {
        await updateTheme(darkMode ? 'dark' : 'light', newPalette);
        showToast(language === 'fr' ? '✓ Thème sauvegardé' : '✓ Theme saved');
      } catch (e) {
        console.error('Failed to save palette', e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        {/* Mode Clair/Sombre */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {language === 'fr' ? 'Mode d\'affichage' : 'Display Mode'}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleModeChange(false)}
              className={cn(
                "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
                !darkMode 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="text-sm">{language === 'fr' ? 'Clair' : 'Light'}</span>
              {!darkMode && <Check className="w-4 h-4 text-primary" />}
            </button>
            <button
              onClick={() => handleModeChange(true)}
              className={cn(
                "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
                darkMode 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <Moon className="w-5 h-5 text-slate-400" />
              <span className="text-sm">{language === 'fr' ? 'Sombre' : 'Dark'}</span>
              {darkMode && <Check className="w-4 h-4 text-primary" />}
            </button>
          </div>
        </div>

        {/* Palette de couleurs */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Palette className="w-4 h-4" />
            {language === 'fr' ? 'Palette de couleurs' : 'Color Palette'}
            {isSaving && (
              <span className="ml-auto text-xs text-muted-foreground animate-pulse">
                {language === 'fr' ? 'Sauvegarde...' : 'Saving...'}
              </span>
            )}
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(PALETTES) as PaletteType[]).map((paletteKey) => {
              const paletteInfo = PALETTES[paletteKey];
              const preview = PALETTE_PREVIEWS[paletteKey];
              const isSelected = palette === paletteKey;
              
              return (
                <button
                  key={paletteKey}
                  onClick={() => handlePaletteChange(paletteKey)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all",
                    isSelected 
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center relative overflow-hidden",
                    preview.bg
                  )}>
                    <div className={cn("w-3 h-3 rounded-full", preview.accent)} />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs">{paletteInfo.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Indicateur de synchronisation */}
        {isPrefsAuth && (
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {language === 'fr' 
              ? 'Synchronisé avec votre compte'
              : 'Synced with your account'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DoseMate() {
  const { t, language } = useLanguage();
  const { hasAccepted, acceptOnboarding, isLoading: isLoadingOnboarding } = useOnboarding();
  const { palette, setPalette } = usePalette();
  
  // Firebase dose history hook
  const { 
    history: firebaseHistory, 
    isAuthenticated: isFirebaseAuth, 
    addDose: addFirebaseDose, 
    removeDose: removeFirebaseDose 
  } = useDoseHistory();
  
  // Firebase user preferences hook
  const {
    preferences,
    isAuthenticated: isPrefsAuth,
    updateTheme
  } = useUserPreferences();

  // State
  const [glycemia, setGlycemia] = useState<string>("");
  const [foodItems, setFoodItems] = useState<FoodItem[]>([{ id: "f-1", carbsPer100: "", weight: "" }]);
  const [carbRatio, setCarbRatio] = useState<number>(DEFAULT_CARB_RATIO);
  const [customInsulinTable, setCustomInsulinTable] = useState<DoseRange[]>(DEFAULT_INSULIN_TABLE);
  const [useCustomTable, setUseCustomTable] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [forceExtra, setForceExtra] = useState<boolean>(false);
  const [toast, setToast] = useState<{ id: string; text: string; fading?: boolean } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [alertHypo, setAlertHypo] = useState<boolean>(false);
  const [alertHypoPulse, setAlertHypoPulse] = useState<boolean>(false);
  const [alertHyper, setAlertHyper] = useState<boolean>(false);
  const [alertHyperPulse, setAlertHyperPulse] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [resultPulse, setResultPulse] = useState<boolean>(false);
  const [isMealCardOpen, setIsMealCardOpen] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("glycemia");
  const [showExpertCard, setShowExpertCard] = useState<boolean>(false);
  const [expertTabValue, setExpertTabValue] = useState<string>("meal");

  // Reset to glycemia tab on mount
  useEffect(() => {
    setActiveTab("glycemia");
  }, []);

  const resultRef = useRef<HTMLDivElement>(null);
  const mealRef = useRef<HTMLDivElement>(null);

  /* ============================
     Logic
     ============================ */

  // Persistance robuste : chargement au démarrage avec Capacitor Preferences
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[DoseMate] Starting data load...');

        // Charge uniquement l'historique (pas les valeurs de calcul en cours)
        const raw = await getNativeItem(STORAGE_KEY);
        if (raw) {
          const loadedHistory = JSON.parse(raw);
          if (Array.isArray(loadedHistory)) {
            setHistory(loadedHistory);
            console.log('[DoseMate] History loaded:', loadedHistory.length, 'entries');
          }
        }

        // Charge les paramètres utilisateur
        const meta = await getNativeItem(STORAGE_META_KEY);
        if (meta) {
          console.log('[DoseMate] Meta loaded:', meta);
          const parsed = JSON.parse(meta);

          // Garde-fou : s'assurer que carbRatio est un nombre valide et positif
          if (parsed.carbRatio !== undefined && parsed.carbRatio !== null) {
            const loadedRatio = Number(parsed.carbRatio);
            if (Number.isFinite(loadedRatio) && loadedRatio > 0) {
              setCarbRatio(loadedRatio);
              console.log('[DoseMate] CarbRatio set to:', loadedRatio);
            } else {
              setCarbRatio(DEFAULT_CARB_RATIO);
              console.log('[DoseMate] Invalid carbRatio, using default:', DEFAULT_CARB_RATIO);
            }
          }

          if (parsed.darkMode !== undefined) {
            setDarkMode(parsed.darkMode);
            console.log('[DoseMate] DarkMode set to:', parsed.darkMode);
            // Appliquer immédiatement le thème
            if (parsed.darkMode) {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
        }

        // Charge le tableau personnalisé avec vérifications robustes (compatible anciennes versions)
        const customTableRaw = await getNativeItem(STORAGE_CUSTOM_TABLE_KEY);
        console.log('[DoseMate] Custom table raw:', customTableRaw ? 'exists' : 'null');

        if (customTableRaw) {
          try {
            const parsed = JSON.parse(customTableRaw);
            console.log('[DoseMate] Custom table parsed:', parsed);

            // Supporte à la fois l'ancien format (tableau brut) et le nouveau ({ table, useCustom })
            const loadedTable: DoseRange[] | null = Array.isArray(parsed)
              ? parsed
              : parsed && Array.isArray(parsed.table)
              ? parsed.table
              : null;

            if (loadedTable && loadedTable.length > 0) {
              setCustomInsulinTable(loadedTable);
              console.log('[DoseMate] Custom table set with', loadedTable.length, 'ranges');

              // Charge le flag useCustom depuis les données sauvegardées
              const savedUseCustom = parsed && typeof parsed.useCustom === 'boolean'
                ? parsed.useCustom
                : false;

              // Active automatiquement le tableau personnalisé si au moins une valeur > 0 existe
              const hasValues = loadedTable.some((range) =>
                Object.values(range.doses).some((dose) => dose > 0)
              );

              const shouldUseCustom = savedUseCustom || hasValues;
              setUseCustomTable(shouldUseCustom);
              console.log('[DoseMate] UseCustomTable set to:', shouldUseCustom, '(saved:', savedUseCustom, ', hasValues:', hasValues, ')');
            } else {
              console.log('[DoseMate] No valid table found, using defaults');
              setCustomInsulinTable(DEFAULT_INSULIN_TABLE);
              setUseCustomTable(false);
            }
          } catch (parseError) {
            console.error('[DoseMate] Failed to parse custom table data:', parseError);
            setCustomInsulinTable(DEFAULT_INSULIN_TABLE);
            setUseCustomTable(false);
          }
        } else {
          console.log('[DoseMate] No custom table found, using defaults');
          setCustomInsulinTable(DEFAULT_INSULIN_TABLE);
          setUseCustomTable(false);
        }
      } catch (e) {
        console.error('[DoseMate] Failed to load stored data:', e);
        // En cas d'erreur, réinitialiser avec les valeurs par défaut
        setCustomInsulinTable(DEFAULT_INSULIN_TABLE);
        setCarbRatio(DEFAULT_CARB_RATIO);
        setUseCustomTable(false);
      } finally {
        setIsDataLoaded(true);
        console.log('[DoseMate] Data load complete');
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!isDataLoaded) return;

    const saveMeta = async () => {
      const meta = { carbRatio, darkMode };
      try {
        console.log('[DoseMate] Saving meta:', meta);
        await setNativeItem(STORAGE_META_KEY, JSON.stringify(meta));
        console.log('[DoseMate] Meta saved successfully');
      } catch (e) {
        console.error('[DoseMate] Failed to save meta data:', e);
      }
    };
    saveMeta();
  }, [carbRatio, darkMode, isDataLoaded]);

  // Sauvegarde automatique et immédiate du tableau personnalisé avec Capacitor Preferences
  useEffect(() => {
    if (!isDataLoaded) return;

    const saveCustomTable = async () => {
      try {
        // Vérifie que les données sont valides avant de sauvegarder
        if (Array.isArray(customInsulinTable) && customInsulinTable.length > 0) {
          const hasValues = customInsulinTable.some((range) =>
            Object.values(range.doses).some((dose) => dose > 0)
          );

          const customTableData = {
            table: customInsulinTable,
            useCustom: useCustomTable
          };

          console.log('[DoseMate] Saving custom table:', {
            ranges: customInsulinTable.length,
            useCustom: useCustomTable,
            hasValues
          });

          await setNativeItem(STORAGE_CUSTOM_TABLE_KEY, JSON.stringify(customTableData));
          console.log('[DoseMate] Custom table saved successfully');
        }
      } catch (e) {
        console.error('[DoseMate] Failed to save custom table data:', e);
      }
    };
    saveCustomTable();
  }, [customInsulinTable, useCustomTable, isDataLoaded]);

  // S'assure que le flag useCustomTable est activé dès qu'au moins une valeur du tableau est > 0
  // Mais seulement après le chargement initial pour éviter les conflits
  useEffect(() => {
    if (!isDataLoaded) return;
    if (!Array.isArray(customInsulinTable) || customInsulinTable.length === 0) return;

    const hasValues = customInsulinTable.some((range) =>
      Object.values(range.doses).some((dose) => dose > 0)
    );

    if (hasValues && !useCustomTable) {
      console.log('[DoseMate] Auto-enabling custom table (has values)');
      setUseCustomTable(true);
    }
  }, [customInsulinTable, useCustomTable, isDataLoaded]);

  function showToast(text: string, ms = 2800) {
    const id = uid("toast");
    setToast({ id, text, fading: false });
    setTimeout(() => {
      setToast((t) => (t && t.id === id ? { ...t, fading: true } : t));
    }, ms - 300);
    setTimeout(() => {
      setToast((t) => (t && t.id === id ? null : t));
    }, ms);
  }

  function addFoodItem() {
    setFoodItems((prev) => [...prev, { id: uid("f"), carbsPer100: "", weight: "" }]);
  }
  
  function removeFoodItem(id: string) {
    setFoodItems((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev));
  }
  
  function updateFoodItem(id: string, field: keyof FoodItem, val: string) {
    setFoodItems((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: val } : p)));
  }

  const calculation = useMemo(() => {
    const gly = parseNumberInput(glycemia);
    const result: any = {
      moment: forceExtra ? "extra" : getMomentOfDay(),
      base: null,
      meal: null,
      totalCalculated: 0,
      totalAdministered: 0,
      note: null,
    };

    // Partie A : Correction Glycémie (lookup dans le tableau)
    const activeTable = useCustomTable ? customInsulinTable : DEFAULT_INSULIN_TABLE;
    if (!Number.isNaN(gly)) {
      if (gly < 70) result.hypo = true;
      if (gly > 351) result.hyper = true;
      
      // Recherche de la plage correspondante
      let range = activeTable.find((r) => gly >= r.min && gly <= r.max);
      
      // Si aucune plage n'est trouvée et que gly > 351, utiliser la dernière plage du tableau
      if (!range && gly > 351 && activeTable.length > 0) {
        range = activeTable[activeTable.length - 1];
      }
      
      if (range) {
        result.base = range.doses[result.moment] ?? 0;
        result.totalCalculated += result.base;
      }
    }

    // Partie B : Dose Repas (glucides / ratio)
    const totalCarbs = foodItems.reduce((sum, it) => {
      const c100 = parseNumberInput(it.carbsPer100) || 0;
      const w = parseNumberInput(it.weight) || 0;
      return sum + (c100 * w) / 100;
    }, 0);

    // Garde-fou : vérifier que carbRatio est un nombre valide et positif
    const validCarbRatio = Number(carbRatio);
    if (totalCarbs > 0 && Number.isFinite(validCarbRatio) && validCarbRatio > 0) {
      const mealDose = totalCarbs / validCarbRatio;
      result.meal = Math.round(mealDose);
      result.totalCalculated += mealDose;
    } else if (totalCarbs > 0) {
      // Si des glucides sont saisis mais le ratio est invalide, meal reste à null
      result.meal = 0;
    }

    // Plafonnement
    if (result.totalCalculated > MAX_CALCULATED) {
      result.totalCalculated = MAX_CALCULATED;
    }

    result.totalAdministered = Math.round(
      result.totalCalculated > DISPLAY_MAX ? DISPLAY_MAX : result.totalCalculated
    );

    if (result.totalCalculated > DISPLAY_MAX) {
      result.alertMax = true;
      result.note = `Dose calculée exacte : ${Number(result.totalCalculated.toFixed(1))} U - dose administrée plafonnée à ${DISPLAY_MAX} U.`;
    } else {
      result.alertMax = false;
      result.note = null;
    }

    return result;
  }, [glycemia, foodItems, customInsulinTable, useCustomTable, carbRatio, forceExtra]);

  useEffect(() => {
    if (calculation.hypo) {
      const timeout = setTimeout(() => {
        setAlertHypo(true);
        setAlertHypoPulse(true);
      }, 2000); // Délai x2 (était implicite à ~1s, maintenant 2s)
      return () => clearTimeout(timeout);
    } else {
      setAlertHypo(false);
      setAlertHypoPulse(false);
    }
  }, [calculation.hypo]);

  useEffect(() => {
    if (alertHypoPulse) {
      const timeout = setTimeout(() => {
        setAlertHypoPulse(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [alertHypoPulse]);

  useEffect(() => {
    if (calculation.hyper) {
      const timeout = setTimeout(() => {
        setAlertHyper(true);
        setAlertHyperPulse(true);
      }, 2000);
      return () => clearTimeout(timeout);
    } else {
      setAlertHyper(false);
      setAlertHyperPulse(false);
    }
  }, [calculation.hyper]);

  useEffect(() => {
    if (alertHyperPulse) {
      const timeout = setTimeout(() => {
        setAlertHyperPulse(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [alertHyperPulse]);


  const resultDisplay = useMemo(() => {
    // Guard against undefined translations
    if (!t || !t.result) {
      return "";
    }
    
    const r = calculation;
    const parts: string[] = [];
    if (r.base !== null && r.base !== undefined) parts.push(`${r.base}u ${t.result.protocol}`);
    if (r.meal !== null && r.meal !== undefined) parts.push(`${r.meal}u ${t.result.mealShort}`);
    
    let display = "";
    if (parts.length > 0) {
      display = parts.join(" + ") + " = ";
    }
    display += `${r.totalAdministered}u (${t.result.administered})`;
    
    if (r.alertMax && r.totalCalculated !== undefined) {
      display += ` (${t.result.actual} ${Number(r.totalCalculated.toFixed(1))}u)`;
    }
    return display;
  }, [calculation, t]);

  // Vérifier si la configuration est complète
  function isConfigComplete() {
    // Vérifier le ratio glucides
    const validRatio = Number(carbRatio);
    if (!Number.isFinite(validRatio) || validRatio <= 0) {
      return false;
    }
    
    // Vérifier si le tableau a au moins une valeur non-zéro
    const activeTable = useCustomTable ? customInsulinTable : DEFAULT_INSULIN_TABLE;
    const hasTableValues = activeTable.some(range => 
      Object.values(range.doses).some(dose => dose > 0)
    );
    
    return hasTableValues;
  }

  async function pushToHistory() {
    // Sécurisation : vérifier la configuration avant d'enregistrer
    if (!isConfigComplete()) {
      showToast(t.settings.configurationMissing);
      setShowExpertCard(true);
      setActiveTab("settings");
      return;
    }
    
    const entry: HistoryEntry = {
      id: uid("h"),
      dateISO: nowISO(),
      display: resultDisplay,
      glycemia: parseNumberInput(glycemia) || undefined,
      base: calculation.base ?? undefined,
      meal: calculation.meal ?? undefined,
      totalAdministered: calculation.totalAdministered,
      totalCalculated: Number(calculation.totalCalculated.toFixed(1)),
      moment: calculation.moment
    };
    
    // Sauvegarde Firebase si authentifié
    if (isFirebaseAuth) {
      try {
        await addFirebaseDose(entry);
        showToast(t.toasts.saved);
      } catch (e) {
        console.error("Failed to save to Firebase", e);
        showToast("⚠️ Erreur de sauvegarde");
      }
    } else {
      // Fallback localStorage
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, 25);
        setNativeItem(STORAGE_KEY, JSON.stringify(next)).catch(e => 
          console.error("Failed to save history", e)
        );
        showToast(t.toasts.saved);
        return next;
      });
    }
  }

  function clearHistory() {
    // Pour Firebase, on ne peut pas tout supprimer d'un coup facilement
    // donc on garde la logique localStorage pour le moment
    setHistory([]);
    removeNativeItem(STORAGE_KEY).catch(e => 
      console.error("Failed to clear history", e)
    );
    showToast(t.history.cleared);
  }

  async function deleteHistoryEntry(id: string) {
    // Suppression Firebase si authentifié
    if (isFirebaseAuth) {
      try {
        await removeFirebaseDose(id);
        showToast(t.history.deleted);
      } catch (e) {
        console.error("Failed to delete from Firebase", e);
        showToast("⚠️ Erreur de suppression");
      }
    } else {
      // Fallback localStorage
      setHistory((prev) => {
        const next = prev.filter((entry) => entry.id !== id);
        setNativeItem(STORAGE_KEY, JSON.stringify(next)).catch(e => 
          console.error("Failed to delete history entry", e)
        );
        showToast(t.history.deleted);
        return next;
      });
    }
  }

  // Auto-save useEffect supprimé - l'historique est sauvegardé uniquement via pushToHistory() lors du clic sur "Enregistrer"

  function resetInputs() {
    setGlycemia("");
    setFoodItems([{ id: "f-1", carbsPer100: "", weight: "" }]);
    setForceExtra(false);
    
    // Fermer la MealCard si elle contient des données
    const hasData = foodItems.some(item => item.carbsPer100 || item.weight);
    if (hasData) {
      setIsMealCardOpen(false);
    }
  }

  useEffect(() => {
    if (!forceExtra) return;
    if (glycemia.trim() !== "") return;
    const timeout = setTimeout(() => {
      setForceExtra(false);
      showToast(t.toasts.supplementCancelled);
    }, 15000);
    return () => clearTimeout(timeout);
  }, [forceExtra, glycemia]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ============================
     Render
     ============================ */

  const handleAcceptOnboarding = async () => {
    await acceptOnboarding();
    setExpertTabValue("table");
    setShowExpertCard(true);
  };

  return (
    <>
      <OnboardingModal open={!isLoadingOnboarding && !hasAccepted} onAccept={handleAcceptOnboarding} />
      
      <div className="safe-area-container transition-colors duration-200">
        <div className="max-w-4xl mx-auto space-y-1.5 md:space-y-2">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <img src={dosemateLogo} alt="DoseMate Logo" className="h-8 w-8" />
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-foreground">{t.header.title}</h1>
                    <p className="text-xs text-muted-foreground">
                      {t.header.subtitle}
                    </p>
                  </div>
                </div>
                <SteampunkClock />
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <LanguageToggle />
                <button
                  onClick={() => {
                    setShowExpertCard((s) => !s);
                    if (!showExpertCard) {
                      showToast(t.settings.parametersOpen);
                    }
                  }}
                  className="glass-button-sm p-2"
                  title={t.settings.parametersTitle}
                >
                  <span className="text-xl">⚙️</span>
                </button>
              </div>
            </div>
          </div>

        {/* Hypo alert */}
        {alertHypo && (
          <Alert className={`border-destructive bg-destructive/10 ${alertHypoPulse ? 'animate-pulse' : ''}`}>
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive font-semibold">
              {t.glycemia.hypoAlert.replace("{value}", glycemia)}
            </AlertDescription>
          </Alert>
        )}

        {/* Hyper alert */}
        {alertHyper && (
          <Alert className={`border-destructive bg-destructive/10 ${alertHyperPulse ? 'animate-pulse' : ''}`}>
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive font-semibold">
              {t.glycemia.hyperAlert.replace("{value}", glycemia)}
            </AlertDescription>
          </Alert>
        )}

        {/* Expert Card - Full Screen */}
        {showExpertCard ? (
          <Card className="min-h-[60vh]">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">{t.settings.parametersTitle}</h2>
                <Button
                  onClick={() => setShowExpertCard(false)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {t.header.close}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Thèmes - Premium Only */}
                <PremiumBadge featureName={language === 'fr' ? 'Les thèmes' : 'Themes'}>
                  <PaletteSelector />
                </PremiumBadge>
                
                {/* Mode Clair/Sombre - Premium Only */}
                <PremiumBadge featureName={language === 'fr' ? 'Le mode clair/sombre' : 'Light/dark mode'}>
                  <button
                    onClick={() => {
                      if (isPremium()) {
                        setDarkMode((d) => !d);
                        showToast(darkMode ? t.header.lightMode : t.header.darkMode);
                      }
                    }}
                    className="glass-button-sm p-2 flex items-center gap-2"
                    title="Toggle theme"
                  >
                    <span className="text-base">{darkMode ? "🌙" : "☀️"}</span>
                  </button>
                </PremiumBadge>
              </div>
              
              <Tabs value={expertTabValue} onValueChange={setExpertTabValue} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-2">
                  <TabsTrigger value="meal" className="text-xs">Paramètres<br />repas</TabsTrigger>
                  <TabsTrigger value="table" className="text-xs">Tableau</TabsTrigger>
                </TabsList>
                
                <TabsContent value="meal" className="mt-2">
                  <MealParametersSettings
                    carbRatio={carbRatio}
                    onCarbRatioChange={setCarbRatio}
                  />
                </TabsContent>
                
                <TabsContent value="table" className="mt-2">
                  <ExpertSettingsTable
                    customInsulinTable={customInsulinTable}
                    useCustomTable={useCustomTable}
                    onCustomTableChange={setCustomInsulinTable}
                    onToggleCustomTable={() => setUseCustomTable(!useCustomTable)}
                    showToast={showToast}
                    onSaveAndReturn={() => {
                      setShowExpertCard(false);
                      setActiveTab("glycemia");
                    }}
                    compact={false}
                  />
                </TabsContent>
              </Tabs>
              
              <SettingsFooter />
            </CardContent>
          </Card>
        ) : (
          /* All devices: Tabs layout */
          <div>
            <Tabs value={activeTab} onValueChange={(val) => {
              // Bloquer l'accès aux fonctionnalités Premium en mode FREE
              if ((val === 'history' || val === 'settings') && !isPremium()) {
                window.open(PREMIUM_URL, '_blank');
                return;
              }
              setActiveTab(val);
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-2">
                <TabsTrigger value="glycemia" className="text-xs md:text-sm">{t.tabs.glycemia}</TabsTrigger>
                <TabsTrigger value="meal" className="text-xs md:text-sm">{t.tabs.meal}</TabsTrigger>
                <TabsTrigger value="result" className="text-xs md:text-sm">{t.tabs.result}</TabsTrigger>
                {isPremium() ? (
                  <TabsTrigger value="history" className="text-xs md:text-sm">{t.tabs.history}</TabsTrigger>
                ) : (
                  <TabsTrigger value="history" className="text-xs md:text-sm opacity-60 relative">
                    <Lock className="w-3 h-3 mr-1 text-amber-500" />
                    {t.tabs.history}
                  </TabsTrigger>
                )}
                {isPremium() ? (
                  <TabsTrigger value="settings" className="text-xs md:text-sm">
                    <Settings className="w-3 h-3 mr-1" />
                    {language === 'fr' ? 'Thèmes' : 'Themes'}
                  </TabsTrigger>
                ) : (
                  <TabsTrigger value="settings" className="text-xs md:text-sm opacity-60 relative">
                    <Lock className="w-3 h-3 mr-1 text-amber-500" />
                    {language === 'fr' ? 'Thèmes' : 'Themes'}
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="glycemia" className="mt-0">
                <GlycemiaCard
                  glycemia={glycemia}
                  moment={calculation.moment}
                  forceExtra={forceExtra}
                  onGlycemiaChange={setGlycemia}
                  onReset={resetInputs}
                  onSave={() => {
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                    pushToHistory();
                    setResultPulse(true);
                    setActiveTab("result");
                    // Reset pulse après délai
                    setTimeout(() => setResultPulse(false), 100);
                  }}
                  onToggleExtra={() => {
                    setForceExtra((f) => !f);
                    showToast(forceExtra ? t.toasts.supplementOff : t.toasts.supplementOn);
                  }}
                />
              </TabsContent>

              <TabsContent value="meal" className="mt-0">
                <MealCard
                  ref={mealRef}
                  foodItems={foodItems}
                  onAddItem={addFoodItem}
                  onRemoveItem={removeFoodItem}
                  onUpdateItem={updateFoodItem}
                  isOpen={true}
                  onOpenChange={setIsMealCardOpen}
                  onSaveToResult={() => {
                    if (!isConfigComplete()) {
                      showToast("⚠️ Configuration manquante");
                      setShowExpertCard(true);
                      setActiveTab("settings");
                      return;
                    }
                    pushToHistory();
                    setResultPulse(true);
                    setActiveTab("result");
                    // Reset pulse après délai
                    setTimeout(() => setResultPulse(false), 100);
                  }}
                />
              </TabsContent>

              <TabsContent value="result" className="mt-0">
                <ResultCard
                  ref={resultRef}
                  calculation={calculation}
                  pulse={resultPulse}
                />
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {isPremium() ? (
                  <HistoryCard
                    history={isFirebaseAuth ? firebaseHistory : history}
                    onClearHistory={clearHistory}
                    onDeleteEntry={deleteHistoryEntry}
                    showToast={showToast}
                  />
                ) : (
                  <Card className="p-6 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">
                        {language === 'fr' ? 'Historique Premium' : 'Premium History'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {language === 'fr' 
                          ? 'Accédez à l\'historique complet de vos doses avec la version Premium.'
                          : 'Access your complete dose history with the Premium version.'}
                      </p>
                      <Button
                        onClick={() => window.open(PREMIUM_URL, '_blank')}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        {language === 'fr' ? 'Passer à Premium' : 'Upgrade to Premium'}
                      </Button>
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                {isPremium() ? (
                  <SettingsTabContent
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    palette={palette}
                    setPalette={setPalette}
                    isPrefsAuth={isPrefsAuth}
                    updateTheme={updateTheme}
                    language={language}
                    showToast={showToast}
                  />
                ) : (
                  <Card className="p-6 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">
                        {language === 'fr' ? 'Thèmes Premium' : 'Premium Themes'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {language === 'fr' 
                          ? 'Personnalisez l\'apparence de l\'application avec la version Premium.'
                          : 'Customize the app appearance with the Premium version.'}
                      </p>
                      <Button
                        onClick={() => window.open(PREMIUM_URL, '_blank')}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        {language === 'fr' ? 'Passer à Premium' : 'Upgrade to Premium'}
                      </Button>
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        <Card className="bg-muted/30">
          <CardContent className="py-2">
            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              ⚠️ {t.footer.warning}
            </p>
          </CardContent>
        </Card>

        <div className="text-center pb-2 space-y-1">
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} DoseMate. {t.footer.copyright}
          </p>
          <p className="text-xs text-muted-foreground/40">
            v1.0.0
          </p>
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors underline"
          >
            {t.footer.privacy}
          </button>
        </div>
      </div>

      {/* Privacy Modal */}
      <AlertDialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">{t.privacy.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed pt-2 space-y-2">
              <p>
                {t.privacy.content1}
              </p>
              <p>
                {t.privacy.content2}
              </p>
              <p className="pt-2">
                {t.privacy.policyLink}{" "}
                <a 
                  href="https://mrbender7.github.io/glucoflow-docs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors underline"
                >
                  {t.privacy.policyLinkText}
                </a>
                .
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="text-xs" onClick={() => setShowPrivacyModal(false)}>
              {t.privacy.close}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed right-4 bottom-14 p-2.5 rounded-full bg-primary/20 hover:bg-primary/30 backdrop-blur-sm border border-primary/30 transition-all duration-300 z-40 animate-fade-in"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5 text-primary" />
        </button>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed left-1/2 -translate-x-1/2 bottom-16 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-xl z-50 transition-all duration-300 ${
          toast.fading ? "animate-fade-out" : "animate-fade-in"
        }`}>
          <div className="text-sm font-medium">{toast.text}</div>
        </div>
      )}
    </div>
  </>
  );
}
