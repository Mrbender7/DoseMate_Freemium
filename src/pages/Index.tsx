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
import { Sun, Moon, ArrowUp, AlertTriangle } from "lucide-react";
import { PaletteSelector } from "../components/PaletteSelector";
import { LanguageToggle } from "../components/LanguageToggle";
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
import { playNotificationSound } from "../utils/audioPlayer";
import { getNativeItem, setNativeItem, removeNativeItem } from "../utils/nativeStorage";
import { useLanguage } from "../contexts/LanguageContext";
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

export default function DoseMate() {
  const { t, language } = useLanguage();
  const { hasAccepted, acceptOnboarding, isLoading: isLoadingOnboarding } = useOnboarding();
  
  // State
  const [glycemia, setGlycemia] = useState<string>("");
  const [foodItems, setFoodItems] = useState<FoodItem[]>([{ id: "f-1", carbsPer100: "", weight: "" }]);
  const [carbRatio, setCarbRatio] = useState<number>(DEFAULT_CARB_RATIO);
  const [customInsulinTable, setCustomInsulinTable] = useState<DoseRange[]>(DEFAULT_INSULIN_TABLE);
  const [useCustomTable, setUseCustomTable] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [forceExtra, setForceExtra] = useState<boolean>(false);
  const [toast, setToast] = useState<{ id: string; text: string; fading?: boolean } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [alertHypo, setAlertHypo] = useState<boolean>(false);
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
        // Charge uniquement l'historique (pas les valeurs de calcul en cours)
        const raw = await getNativeItem(STORAGE_KEY);
        if (raw) {
          const loadedHistory = JSON.parse(raw);
          if (Array.isArray(loadedHistory)) {
            setHistory(loadedHistory);
          }
        }
        
        // Charge les paramètres utilisateur
        const meta = await getNativeItem(STORAGE_META_KEY);
        if (meta) {
          const parsed = JSON.parse(meta);
          // Garde-fou : s'assurer que carbRatio est un nombre valide et positif
          if (parsed.carbRatio !== undefined && parsed.carbRatio !== null) {
            const loadedRatio = Number(parsed.carbRatio);
            if (Number.isFinite(loadedRatio) && loadedRatio > 0) {
              setCarbRatio(loadedRatio);
            } else {
              // Si le ratio stocké est invalide, utiliser la valeur par défaut
              setCarbRatio(DEFAULT_CARB_RATIO);
            }
          }
          if (parsed.darkMode !== undefined) setDarkMode(parsed.darkMode);
        }
        
        // Charge le tableau personnalisé avec vérifications robustes
        const customTableRaw = await getNativeItem(STORAGE_CUSTOM_TABLE_KEY);
        if (customTableRaw) {
          try {
            const customTableData = JSON.parse(customTableRaw);
            // Vérifie que les données sont valides avant de les charger
            if (customTableData && Array.isArray(customTableData.table)) {
              setCustomInsulinTable(customTableData.table);
              setUseCustomTable(customTableData.useCustom || false);
            } else {
              // Données invalides, utiliser les valeurs par défaut
              setCustomInsulinTable(DEFAULT_INSULIN_TABLE);
            }
          } catch (parseError) {
            console.warn("Failed to parse custom table data, using defaults", parseError);
            setCustomInsulinTable(DEFAULT_INSULIN_TABLE);
          }
        } else {
          // Aucune donnée sauvegardée, utiliser les valeurs par défaut
          setCustomInsulinTable(DEFAULT_INSULIN_TABLE);
        }
      } catch (e) {
        console.warn("Failed to load stored data", e);
        // En cas d'erreur, réinitialiser avec les valeurs par défaut
        setCustomInsulinTable(DEFAULT_INSULIN_TABLE);
        setCarbRatio(DEFAULT_CARB_RATIO);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    const saveMeta = async () => {
      const meta = { carbRatio, darkMode };
      try {
        await setNativeItem(STORAGE_META_KEY, JSON.stringify(meta));
      } catch (e) {
        console.error("Failed to save meta data", e);
      }
    };
    saveMeta();
  }, [carbRatio, darkMode]);

  // Sauvegarde automatique et immédiate du tableau personnalisé avec Capacitor Preferences
  useEffect(() => {
    const saveCustomTable = async () => {
      try {
        // Vérifie que les données sont valides avant de sauvegarder
        if (Array.isArray(customInsulinTable) && customInsulinTable.length > 0) {
          const customTableData = { table: customInsulinTable, useCustom: useCustomTable };
          await setNativeItem(STORAGE_CUSTOM_TABLE_KEY, JSON.stringify(customTableData));
        }
      } catch (e) {
        console.error("Failed to save custom table data", e);
      }
    };
    saveCustomTable();
  }, [customInsulinTable, useCustomTable]);

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
      const range = activeTable.find((r) => gly >= r.min && gly <= r.max);
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
      }, 2000); // Délai x2 (était implicite à ~1s, maintenant 2s)
      return () => clearTimeout(timeout);
    } else {
      setAlertHypo(false);
    }
  }, [calculation.hypo]);

  // Auto-switch to result tab when glycemia is entered
  useEffect(() => {
    if (glycemia && parseNumberInput(glycemia) > 0) {
      const timer = setTimeout(() => {
        setActiveTab("result");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [glycemia]);

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

  function pushToHistory() {
    // Sécurisation : vérifier la configuration avant d'enregistrer
    if (!isConfigComplete()) {
      showToast(t.settings.configurationMissing);
      setShowExpertCard(true);
      setActiveTab("settings");
      return;
    }
    
    // Play notification sound on manual save
    playNotificationSound(`/notification.mp3?v=${Date.now()}`, 5, 1, 0.3);
    
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
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 25);
      // Sauvegarde asynchrone sans bloquer l'UI
      setNativeItem(STORAGE_KEY, JSON.stringify(next)).catch(e => 
        console.error("Failed to save history", e)
      );
      showToast(t.toasts.saved);
      return next;
    });
  }

  function clearHistory() {
    setHistory([]);
    removeNativeItem(STORAGE_KEY).catch(e => 
      console.error("Failed to clear history", e)
    );
    showToast(t.history.cleared);
  }

  function deleteHistoryEntry(id: string) {
    setHistory((prev) => {
      const next = prev.filter((entry) => entry.id !== id);
      // Sauvegarde asynchrone sans bloquer l'UI
      setNativeItem(STORAGE_KEY, JSON.stringify(next)).catch(e => 
        console.error("Failed to delete history entry", e)
      );
      showToast(t.history.deleted);
      return next;
    });
  }

  useEffect(() => {
    if (!calculation || calculation.totalCalculated <= 0) return;
    const timeout = setTimeout(async () => {
      try {
        const prevRaw = await getNativeItem(STORAGE_KEY);
        const prev = prevRaw ? JSON.parse(prevRaw) as HistoryEntry[] : [];
        const now = new Date();
        
        if (prev.length > 0) {
          const last = prev[0];
          const lastDate = new Date(last.dateISO);
          const delta = now.getTime() - lastDate.getTime();
          if (delta < 20000) {
            const newEntry: HistoryEntry = {
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
            const next = [newEntry, ...prev.slice(1)].slice(0, 25);
            await setNativeItem(STORAGE_KEY, JSON.stringify(next));
            setHistory(next);
            showToast(t.toasts.autoUpdated);
            setResultPulse(true);
            setTimeout(() => setResultPulse(false), 2000);
            return;
          }
        }
        const newEntry: HistoryEntry = {
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
        const next = [newEntry, ...(prev || [])].slice(0, 25);
        await setNativeItem(STORAGE_KEY, JSON.stringify(next));
        setHistory(next);
        showToast(t.toasts.autoSaved);
        setResultPulse(true);
        setTimeout(() => setResultPulse(false), 2000);
      } catch (e) {
        console.warn("autosave fail", e);
      }
    }, 1200);
    return () => clearTimeout(timeout);
  }, [resultDisplay, glycemia, calculation]);

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
          <Alert className="border-destructive bg-destructive/10 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive font-semibold">
              ⚠️ {t.glycemia.hypoAlert.replace("{value}", glycemia)}
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
                <PaletteSelector />
                
                <button
                  onClick={() => {
                    setDarkMode((d) => !d);
                    showToast(darkMode ? t.header.lightMode : t.header.darkMode);
                  }}
                  className="glass-button-sm p-2 flex items-center gap-2"
                  title="Toggle theme"
                >
                  <span className="text-base">{darkMode ? "🌙" : "☀️"}</span>
                </button>
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-2">
                <TabsTrigger value="glycemia" className="text-xs md:text-sm">{t.tabs.glycemia}</TabsTrigger>
                <TabsTrigger value="meal" className="text-xs md:text-sm">{t.tabs.meal}</TabsTrigger>
                <TabsTrigger value="result" className="text-xs md:text-sm">{t.tabs.result}</TabsTrigger>
                <TabsTrigger value="history" className="text-xs md:text-sm">{t.tabs.history}</TabsTrigger>
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
                    setActiveTab("result");
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
                <HistoryCard
                  history={history}
                  onClearHistory={clearHistory}
                  onDeleteEntry={deleteHistoryEntry}
                  showToast={showToast}
                />
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
