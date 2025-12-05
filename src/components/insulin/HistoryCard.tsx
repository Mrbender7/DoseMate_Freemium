import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Download, RotateCcw, BarChart3, Trash2, Droplet, Utensils, Syringe, Clock } from "lucide-react";
import type { HistoryEntry } from "../../types/insulin";
import * as XLSX from "xlsx";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from "../../contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface HistoryCardProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
  onDeleteEntry: (id: string) => void;
  showToast: (message: string) => void;
  compact?: boolean;
}

const getMomentConfig = (moment: string, language: string) => {
  const configs: Record<string, { label: string; emoji: string; bgClass: string }> = {
    morning: { 
      label: language === 'fr' ? 'Matin' : 'Morning', 
      emoji: '☀️',
      bgClass: 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
    },
    noon: { 
      label: language === 'fr' ? 'Midi' : 'Noon', 
      emoji: '🌤️',
      bgClass: 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
    },
    evening: { 
      label: language === 'fr' ? 'Soir' : 'Evening', 
      emoji: '🌙',
      bgClass: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
    },
    extra: { 
      label: language === 'fr' ? 'Extra' : 'Extra', 
      emoji: '➕',
      bgClass: 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
    }
  };
  return configs[moment] || configs.extra;
};

export function HistoryCard({ history, onClearHistory, onDeleteEntry, showToast, compact = false }: HistoryCardProps) {
  const { t, language } = useLanguage();
  
  const sevenDaySummary = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    const last7 = history.filter((h) => new Date(h.dateISO) >= sevenDaysAgo);
    if (last7.length === 0) return { avgGly: null as number | null, avgDoseReal: null as number | null, avgDoseAdmin: null as number | null, count: 0 };
    const totalGly = last7.reduce((s, e) => s + (e.glycemia ?? 0), 0);
    const totalDoseReal = last7.reduce((s, e) => s + e.totalCalculated, 0);
    const totalDoseAdmin = last7.reduce((s, e) => s + e.totalAdministered, 0);
    return {
      avgGly: Math.round((totalGly / last7.length) * 10) / 10,
      avgDoseReal: Math.round((totalDoseReal / last7.length) * 10) / 10,
      avgDoseAdmin: Math.round((totalDoseAdmin / last7.length) * 10) / 10,
      count: last7.length,
    };
  }, [history]);

  function exportCSV(): string {
    let csv = "DateISO,Moment,Glycémie,Base,Repas,DoseTotaleAdmin,DoseTotaleCalculée,Détail\n";
    history.forEach((h) => {
      csv += `${h.dateISO},${h.moment},${h.glycemia ?? "-"},${h.base ?? "-"},${h.meal ?? "-"},${h.totalAdministered},${h.totalCalculated},"${h.display.replace(/"/g, '""')}"\n`;
    });
    return csv;
  }
  
  async function downloadCSV() {
    const csvContent = exportCSV();
    const isNative = Capacitor.isNativePlatform();
    
    if (isNative) {
      try {
        const fileName = `dosemate_history_${new Date().toISOString().split('T')[0]}.csv`;
        const result = await Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });
        
        await Share.share({
          title: 'Historique DoseMate',
          text: 'Voici votre historique DoseMate',
          url: result.uri,
          dialogTitle: "Partager l'historique"
        });
        
        showToast("CSV prêt à partager");
      } catch (error) {
        console.error("Erreur téléchargement CSV mobile:", error);
        showToast("Erreur lors du téléchargement CSV");
      }
    } else {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `dosemate_history_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("CSV téléchargé");
    }
  }
  
  async function downloadXLSX() {
    try {
      const isNative = Capacitor.isNativePlatform();
      const ws_data = [["DateISO", "Moment", "Glycémie", "Base", "Repas", "DoseTotaleAdmin", "DoseTotaleCalculée", "Détail"]];
      history.forEach((h) => ws_data.push([
        h.dateISO,
        h.moment,
        h.glycemia !== undefined ? String(h.glycemia) : "-",
        h.base !== undefined ? String(h.base) : "-",
        h.meal !== undefined ? String(h.meal) : "-",
        String(h.totalAdministered),
        String(h.totalCalculated),
        h.display
      ]));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      XLSX.utils.book_append_sheet(wb, ws, "Historique");
      
      if (isNative) {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        const fileName = `dosemate_history_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        const result = await Filesystem.writeFile({
          path: fileName,
          data: wbout,
          directory: Directory.Cache
        });
        
        await Share.share({
          title: 'Historique DoseMate',
          text: 'Voici votre historique DoseMate',
          url: result.uri,
          dialogTitle: "Partager l'historique"
        });
        
        showToast("XLSX prêt à partager");
      } else {
        XLSX.writeFile(wb, `dosemate_history_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast("XLSX téléchargé");
      }
    } catch (error) {
      console.error("Erreur téléchargement XLSX:", error);
      showToast("Erreur lors du téléchargement XLSX");
    }
  }
  
  async function downloadJSON() {
    const jsonContent = JSON.stringify(history, null, 2);
    const isNative = Capacitor.isNativePlatform();
    
    if (isNative) {
      try {
        const fileName = `dosemate_history_${new Date().toISOString().split('T')[0]}.json`;
        const result = await Filesystem.writeFile({
          path: fileName,
          data: jsonContent,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });
        
        await Share.share({
          title: 'Historique DoseMate',
          text: 'Voici votre historique DoseMate',
          url: result.uri,
          dialogTitle: "Partager l'historique"
        });
        
        showToast("JSON prêt à partager");
      } catch (error) {
        console.error("Erreur téléchargement JSON mobile:", error);
        showToast("Erreur lors du téléchargement JSON");
      }
    } else {
      const blob = new Blob([jsonContent], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `dosemate_history_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("JSON téléchargé");
    }
  }

  const formatDateTime = (dateISO: string) => {
    const date = new Date(dateISO);
    return {
      time: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
    };
  };

  return (
    <Card className="transition-all duration-300">
      <CardHeader className="py-2 px-3">
        <CardTitle className="flex items-center gap-1.5 text-primary text-base">
          <BarChart3 className="h-4 w-4" />
          {t.history.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 py-2 px-3">
        {/* Statistiques et exports */}
        <div className="flex flex-col items-start gap-2 bg-muted/20 rounded-lg p-2.5">
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 grid grid-cols-3 gap-2 text-center">
              <div className="p-1.5 rounded-lg bg-card/50 border border-border/30">
                <div className="text-lg font-bold text-primary">{history.length}</div>
                <div className="text-[9px] text-muted-foreground">{t.history.entries}</div>
              </div>
              <div className="p-1.5 rounded-lg bg-card/50 border border-border/30">
                <div className="text-lg font-bold text-primary">
                  {sevenDaySummary.avgDoseAdmin ?? '-'}U
                </div>
                <div className="text-[9px] text-muted-foreground">Moy. 7j</div>
              </div>
              <div className="p-1.5 rounded-lg bg-card/50 border border-border/30">
                <div className="text-lg font-bold text-primary">
                  {sevenDaySummary.avgGly ?? '-'}
                </div>
                <div className="text-[9px] text-muted-foreground">Glyc. moy</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            <Button onClick={downloadCSV} variant="outline" size="sm" className="gap-1 h-7 px-2 text-[10px]">
              <Download className="h-2.5 w-2.5" /> CSV
            </Button>
            <Button onClick={downloadXLSX} variant="outline" size="sm" className="gap-1 h-7 px-2 text-[10px]">
              <Download className="h-2.5 w-2.5" /> XLSX
            </Button>
            <Button onClick={downloadJSON} variant="outline" size="sm" className="gap-1 h-7 px-2 text-[10px]">
              <Download className="h-2.5 w-2.5" /> JSON
            </Button>
            <Button onClick={onClearHistory} variant="outline" size="sm" className="gap-1 h-7 px-2 text-[10px]">
              <RotateCcw className="h-2.5 w-2.5" /> {t.history.clearShort}
            </Button>
          </div>
        </div>

        {/* Liste des entrées */}
        <div className="space-y-2 overflow-auto hide-scrollbar max-h-[40vh]">
          {history.length === 0 ? (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                <Syringe className="h-7 w-7 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {language === 'fr' ? 'Aucune dose enregistrée' : 'No doses recorded'}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'fr' 
                  ? 'Enregistrez votre première dose pour commencer.'
                  : 'Save your first dose to get started.'}
              </p>
            </div>
          ) : (
            history.map((h, index) => {
              const { time, date } = formatDateTime(h.dateISO);
              const momentConfig = getMomentConfig(h.moment, language);
              
              return (
                <div 
                  key={h.id} 
                  className={cn(
                    "group rounded-xl bg-gradient-to-br from-card to-card/80 border border-border/50",
                    "hover:border-primary/30 transition-all duration-300 p-3 relative",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* En-tête: Date/Heure + Moment */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{time}</span>
                      <span className="opacity-50">•</span>
                      <span>{date}</span>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-medium",
                      momentConfig.bgClass
                    )}>
                      {momentConfig.emoji} {momentConfig.label}
                    </span>
                  </div>

                  {/* Dose principale */}
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <Syringe className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold text-primary">{h.totalAdministered}</span>
                    <span className="text-sm text-primary/70">U</span>
                    {h.totalCalculated !== h.totalAdministered && (
                      <span className="text-xs text-muted-foreground ml-1">
                        (calc: {Number(h.totalCalculated.toFixed(1))}U)
                      </span>
                    )}
                  </div>

                  {/* Détails */}
                  <div className="flex flex-wrap gap-2">
                    {h.glycemia !== undefined && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 text-xs">
                        <Droplet className="h-3 w-3 text-blue-500" />
                        <span className="font-medium">{h.glycemia}</span>
                        <span className="text-muted-foreground">mg/dL</span>
                        {h.base !== undefined && h.base !== null && (
                          <span className="text-blue-500">→ {h.base}U</span>
                        )}
                      </div>
                    )}
                    {h.meal !== undefined && h.meal !== null && h.meal > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/10 text-xs">
                        <Utensils className="h-3 w-3 text-orange-500" />
                        <span className="font-medium">{h.meal}U</span>
                        <span className="text-orange-500">{language === 'fr' ? 'repas' : 'meal'}</span>
                      </div>
                    )}
                  </div>

                  {/* Bouton supprimer */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteEntry(h.id)}
                    className={cn(
                      "absolute top-2 right-2 h-6 w-6",
                      "text-muted-foreground/40 hover:text-destructive",
                      "opacity-0 group-hover:opacity-100 transition-opacity"
                    )}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
