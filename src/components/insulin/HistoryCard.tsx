import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Download, RotateCcw, BarChart3, X } from "lucide-react";
import { momentIcon } from "../../utils/calculations";
import type { HistoryEntry } from "../../types/insulin";
import * as XLSX from "xlsx";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from "../../contexts/LanguageContext";

interface HistoryCardProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
  onDeleteEntry: (id: string) => void;
  showToast: (message: string) => void;
  compact?: boolean;
}

export function HistoryCard({ history, onClearHistory, onDeleteEntry, showToast, compact = false }: HistoryCardProps) {
  const { t } = useLanguage();
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
        // Sur mobile, on enregistre et partage le fichier
        const fileName = `glucoflow_history_${new Date().toISOString().split('T')[0]}.csv`;
        const result = await Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });
        
        await Share.share({
          title: 'Historique GlucoFlow',
          text: 'Voici votre historique GlucoFlow',
          url: result.uri,
          dialogTitle: 'Partager l\'historique'
        });
        
        showToast("CSV prêt à partager");
      } catch (error) {
        console.error("Erreur téléchargement CSV mobile:", error);
        showToast("Erreur lors du téléchargement CSV");
      }
    } else {
      // Sur web, téléchargement classique
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `glucoflow_history_${new Date().toISOString().split('T')[0]}.csv`;
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
        // Sur mobile, on convertit en base64 et partage
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        const fileName = `glucoflow_history_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        const result = await Filesystem.writeFile({
          path: fileName,
          data: wbout,
          directory: Directory.Cache
        });
        
        await Share.share({
          title: 'Historique GlucoFlow',
          text: 'Voici votre historique GlucoFlow',
          url: result.uri,
          dialogTitle: 'Partager l\'historique'
        });
        
        showToast("XLSX prêt à partager");
      } else {
        // Sur web, téléchargement classique
        XLSX.writeFile(wb, `glucoflow_history_${new Date().toISOString().split('T')[0]}.xlsx`);
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
        // Sur mobile, on enregistre et partage le fichier
        const fileName = `glucoflow_history_${new Date().toISOString().split('T')[0]}.json`;
        const result = await Filesystem.writeFile({
          path: fileName,
          data: jsonContent,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });
        
        await Share.share({
          title: 'Historique GlucoFlow',
          text: 'Voici votre historique GlucoFlow',
          url: result.uri,
          dialogTitle: 'Partager l\'historique'
        });
        
        showToast("JSON prêt à partager");
      } catch (error) {
        console.error("Erreur téléchargement JSON mobile:", error);
        showToast("Erreur lors du téléchargement JSON");
      }
    } else {
      // Sur web, téléchargement classique
      const blob = new Blob([jsonContent], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `glucoflow_history_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("JSON téléchargé");
    }
  }

  return (
    <Card className="transition-all duration-300">
      <CardHeader className="py-2 px-3">
        <CardTitle className="flex items-center gap-1.5 text-primary text-base">
          <BarChart3 className="h-4 w-4" />
          {t.history.title}
        </CardTitle>
        <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5 flex-wrap text-[10px]">
          <span className="flex items-center gap-0.5">☀️ {t.history.morning}</span>
          <span className="flex items-center gap-0.5">🌤️ {t.history.noon}</span>
          <span className="flex items-center gap-0.5">🌙 {t.history.evening}</span>
          <span className="flex items-center gap-0.5"><span className="text-destructive font-bold">+</span> {t.history.supplement}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 py-2 px-3">
        <div className="flex flex-col items-start gap-1.5 bg-muted/20 rounded-lg p-2">
          <div className="text-[11px]">
            <div className="font-semibold text-foreground">{t.history.entries} : {history.length}</div>
            <div className="text-muted-foreground mt-0.5">
              {sevenDaySummary.count > 0 
                ? `7j: ${sevenDaySummary.avgGly} mg/dL - ${sevenDaySummary.avgDoseAdmin} u` 
                : t.history.noData}
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

        <div className="space-y-1 overflow-auto hide-scrollbar max-h-[40vh]">
          {history.length === 0 ? (
            <div className="text-muted-foreground text-center py-3 text-xs">{t.history.empty}</div>
          ) : (
            history.map((h) => (
              <div key={h.id} className="rounded-lg bg-card/50 border border-border/50 hover:bg-card/80 transition-colors p-2 relative">
                <button
                  onClick={() => onDeleteEntry(h.id)}
                  className="absolute top-1 right-1 p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={t.history.deleteEntry}
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="flex items-center justify-between mb-0.5 pr-5">
                  <div className="text-muted-foreground text-[10px]">
                    {momentIcon(h.moment)} {new Date(h.dateISO).toLocaleString("fr-FR", { 
                      day: "2-digit", 
                      month: "2-digit", 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </div>
                </div>
                <div className="font-medium text-foreground text-xs">{h.display}</div>
                <div className="text-muted-foreground mt-0.5 text-[10px]">
                  {t.history.admin}: {h.totalAdministered} u - {t.history.calc}: {Number(h.totalCalculated.toFixed(1))} u
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
