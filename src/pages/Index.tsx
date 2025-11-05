import { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Calculator, Sun, Moon, ArrowUp, AlertTriangle } from "lucide-react";
import { GlycemiaCard } from "../components/insulin/GlycemiaCard";
import { MealCard } from "../components/insulin/MealCard";
import { ExpertSettings } from "../components/insulin/ExpertSettings";
import { ResultCard } from "../components/insulin/ResultCard";
import { HistoryCard } from "../components/insulin/HistoryCard";
import { uid, parseNumberInput, nowISO, getMomentOfDay } from "../utils/calculations";
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

export default function GlucoFlow() {
  // Original v2.1 state
  const [glycemia, setGlycemia] = useState<string>("");
  const [foodItems, setFoodItems] = useState<FoodItem[]>([{ id: "f-1", carbsPer100: "", weight: "" }]);
  const [carbRatio, setCarbRatio] = useState<number>(DEFAULT_CARB_RATIO);
  const [sensitivityFactor, setSensitivityFactor] = useState<number | "">(50);
  const [targetByMoment, setTargetByMoment] = useState<Record<MomentKey, number>>({
    morning: 100,
    noon: 100,
    evening: 110,
    extra: 110,
  });
  const [customInsulinTable, setCustomInsulinTable] = useState<DoseRange[]>(DEFAULT_INSULIN_TABLE);
  const [useCustomTable, setUseCustomTable] = useState<boolean>(false);
  const [modeExpert, setModeExpert] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [forceExtra, setForceExtra] = useState<boolean>(false);
  const [toast, setToast] = useState<{ id: string; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [alertHypo, setAlertHypo] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [resultPulse, setResultPulse] = useState<boolean>(false);

  const resultRef = useRef<HTMLDivElement>(null);
  const mealRef = useRef<HTMLDivElement>(null);

  /* ============================
     Logic
     ============================ */

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
      const meta = localStorage.getItem(STORAGE_META_KEY);
      if (meta) {
        const parsed = JSON.parse(meta);
        if (parsed.carbRatio) setCarbRatio(parsed.carbRatio);
        if (parsed.sensitivityFactor !== undefined) setSensitivityFactor(parsed.sensitivityFactor);
        if (parsed.targetByMoment) setTargetByMoment(parsed.targetByMoment);
        if (parsed.darkMode !== undefined) setDarkMode(parsed.darkMode);
        if (parsed.modeExpert !== undefined) setModeExpert(parsed.modeExpert);
      }
      const customTableRaw = localStorage.getItem(STORAGE_CUSTOM_TABLE_KEY);
      if (customTableRaw) {
        const customTableData = JSON.parse(customTableRaw);
        setCustomInsulinTable(customTableData.table);
        setUseCustomTable(customTableData.useCustom || false);
      }
    } catch (e) {
      console.warn("Failed to load stored data", e);
    }
  }, []);

  useEffect(() => {
    const meta = { carbRatio, sensitivityFactor, targetByMoment, darkMode, modeExpert };
    try {
      localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta));
    } catch (e) {}
  }, [carbRatio, sensitivityFactor, targetByMoment, darkMode, modeExpert]);

  useEffect(() => {
    try {
      const customTableData = { table: customInsulinTable, useCustom: useCustomTable };
      localStorage.setItem(STORAGE_CUSTOM_TABLE_KEY, JSON.stringify(customTableData));
    } catch (e) {}
  }, [customInsulinTable, useCustomTable]);

  function showToast(text: string, ms = 2800) {
    const id = uid("toast");
    setToast({ id, text });
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
      correction: null,
      meal: null,
      totalCalculated: 0,
      totalAdministered: 0,
      note: null,
    };

    const activeTable = useCustomTable ? customInsulinTable : DEFAULT_INSULIN_TABLE;
    if (!Number.isNaN(gly)) {
      if (gly < 70) result.hypo = true;
      const range = activeTable.find((r) => gly >= r.min && gly <= r.max);
      if (range) {
        result.base = range.doses[result.moment] ?? 0;
        result.totalCalculated += result.base;
      }

      const sens = typeof sensitivityFactor === "number" && sensitivityFactor > 0 ? sensitivityFactor : NaN;
      const target = targetByMoment[result.moment] ?? 100;
      if (modeExpert && !Number.isNaN(sens) && !Number.isNaN(gly) && gly > target) {
        const corr = (gly - target) / sens;
        result.correction = Math.round(corr * 10) / 10;
        result.totalCalculated += result.correction;
      } else {
        result.correction = null;
      }
    }

    const totalCarbs = foodItems.reduce((sum, it) => {
      const c100 = parseNumberInput(it.carbsPer100) || 0;
      const w = parseNumberInput(it.weight) || 0;
      return sum + (c100 * w) / 100;
    }, 0);

    if (totalCarbs > 0) {
      const mealDose = totalCarbs / (carbRatio || DEFAULT_CARB_RATIO);
      result.meal = Math.round(mealDose);
      result.totalCalculated += mealDose;
    }

    if (result.totalCalculated > MAX_CALCULATED) {
      result.totalCalculated = MAX_CALCULATED;
    }

    result.totalAdministered = Math.round(
      result.totalCalculated > DISPLAY_MAX ? DISPLAY_MAX : result.totalCalculated
    );

    if (result.totalCalculated > DISPLAY_MAX) {
      result.alertMax = true;
      result.note = `Dose calculée exacte : ${Number(result.totalCalculated.toFixed(1))} U — dose administrée plafonnée à ${DISPLAY_MAX} U.`;
    } else {
      result.alertMax = false;
      result.note = null;
    }

    return result;
  }, [glycemia, foodItems, customInsulinTable, useCustomTable, sensitivityFactor, targetByMoment, carbRatio, modeExpert, forceExtra]);

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

  const resultDisplay = useMemo(() => {
    const r = calculation;
    const parts: string[] = [];
    if (r.base !== null && r.base !== undefined) parts.push(`${r.base}u base`);
    if (r.correction !== null && r.correction !== undefined) parts.push(`${r.correction}u corr`);
    if (r.meal !== null && r.meal !== undefined) parts.push(`${r.meal}u repas`);
    
    let display = "";
    if (parts.length > 0) {
      display = parts.join(" + ") + " = ";
    }
    display += `${r.totalAdministered}u (admin.)`;
    
    if (r.alertMax && r.totalCalculated !== undefined) {
      display += ` (réelle ${Number(r.totalCalculated.toFixed(1))}u)`;
    }
    return display;
  }, [calculation]);

  function pushToHistory() {
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
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}
      showToast("Calcul enregistré");
      return next;
    });
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    showToast("Historique effacé");
  }

  useEffect(() => {
    if (!calculation || calculation.totalCalculated <= 0) return;
    const timeout = setTimeout(() => {
      try {
        const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as HistoryEntry[];
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
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            setHistory(next);
            showToast("Calcul mis à jour (auto)");
            setResultPulse(true);
            setTimeout(() => setResultPulse(false), 2000);
            resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setHistory(next);
        showToast("Calcul enregistré (auto)");
        setResultPulse(true);
        setTimeout(() => setResultPulse(false), 2000);
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (e) {
        console.warn("autosave fail", e);
      }
    }, 1200);
    return () => clearTimeout(timeout);
  }, [resultDisplay, glycemia, calculation]);

  useEffect(() => {
    const hasWeight = foodItems.some(item => {
      const weight = parseNumberInput(item.weight);
      return weight && weight > 0;
    });
    
    if (!hasWeight) return;
    
    const timeout = setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 1200);
    
    return () => clearTimeout(timeout);
  }, [foodItems]);

  function resetInputs() {
    setGlycemia("");
    setFoodItems([{ id: "f-1", carbsPer100: "", weight: "" }]);
    setForceExtra(false);
  }

  useEffect(() => {
    if (!forceExtra) return;
    if (glycemia.trim() !== "") return;
    const timeout = setTimeout(() => {
      setForceExtra(false);
      showToast("Mode supplément annulé (aucune glycémie)");
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

  return (
    <div className="min-h-screen p-3 md:p-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-2 md:space-y-3">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">GlucoFlow</h1>
              <p className="text-sm text-muted-foreground">
                Calculateur insuline lispro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDarkMode((d) => !d);
                showToast(darkMode ? "Mode clair activé" : "Mode sombre activé");
              }}
              className="glass-button-sm p-2 flex items-center gap-2"
              title="Basculer thème"
            >
              {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <button
              onClick={() => {
                setModeExpert((m) => !m);
                showToast(!modeExpert ? "Mode expert activé" : "Mode simplifié activé");
              }}
              className="glass-button-sm p-2"
              title="Basculer mode"
            >
              <span className="text-xs md:text-sm">{modeExpert ? "Simple" : "Expert"}</span>
            </button>
          </div>
        </div>

        {/* Hypo alert */}
        {alertHypo && (
          <Alert className="border-destructive bg-destructive/10 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive font-semibold">
              ⚠️ Hypoglycémie détectée ({glycemia} mg/dL). Traitez immédiatement et consultez un professionnel.
            </AlertDescription>
          </Alert>
        )}

        <GlycemiaCard
          glycemia={glycemia}
          carbRatio={carbRatio}
          moment={calculation.moment}
          forceExtra={forceExtra}
          onGlycemiaChange={setGlycemia}
          onCarbRatioChange={setCarbRatio}
          onReset={resetInputs}
          onSave={() => {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
            pushToHistory();
          }}
          onToggleExtra={() => {
            setForceExtra((f) => !f);
            showToast(forceExtra ? "Mode auto activé" : "Mode supplément forcé");
          }}
        />

        <MealCard
          ref={mealRef}
          foodItems={foodItems}
          onAddItem={addFoodItem}
          onRemoveItem={removeFoodItem}
          onUpdateItem={updateFoodItem}
        />

        {modeExpert && (
          <ExpertSettings
            sensitivityFactor={sensitivityFactor}
            targetByMoment={targetByMoment}
            customInsulinTable={customInsulinTable}
            useCustomTable={useCustomTable}
            onSensitivityChange={setSensitivityFactor}
            onTargetChange={(moment, value) => setTargetByMoment((s) => ({ ...s, [moment]: value }))}
            onCustomTableChange={setCustomInsulinTable}
            onToggleCustomTable={() => setUseCustomTable(!useCustomTable)}
            showToast={showToast}
          />
        )}

        <ResultCard
          ref={resultRef}
          calculation={calculation}
          onScrollToMeal={() => mealRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
          pulse={resultPulse}
        />

        <HistoryCard
          history={history}
          onClearHistory={clearHistory}
          showToast={showToast}
        />

        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Usage personnel uniquement — ceci n'est pas un avis médical. Consultez toujours votre endocrinologue avant d'appliquer des modifications à votre traitement.
            </p>
          </CardContent>
        </Card>

        <div className="text-center pb-2 space-y-1">
          <p className="text-xs text-muted-foreground/60">
            All rights reserved © F. Malherbe
          </p>
          <p className="text-xs text-muted-foreground/40">
            v1 pro
          </p>
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed right-4 bottom-14 p-2.5 rounded-full bg-primary/20 hover:bg-primary/30 backdrop-blur-sm border border-primary/30 transition-all duration-300 z-40 animate-fade-in md:hidden"
          aria-label="Remonter en haut"
        >
          <ArrowUp className="h-5 w-5 text-primary" />
        </button>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed right-4 bottom-16 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom-5">
          <div className="text-sm font-medium">{toast.text}</div>
        </div>
      )}
    </div>
  );
}
