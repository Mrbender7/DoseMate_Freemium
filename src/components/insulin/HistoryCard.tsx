import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Download, RotateCcw, BarChart3 } from "lucide-react";
import { momentIcon } from "../../utils/calculations";
import type { HistoryEntry } from "../../types/insulin";
import * as XLSX from "xlsx";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

interface HistoryCardProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
  showToast: (message: string) => void;
  compact?: boolean;
}

export function HistoryCard({ history, onClearHistory, showToast, compact = false }: HistoryCardProps) {
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
      <CardHeader className={compact ? "py-2 px-3" : ""}>
        <CardTitle className={`flex items-center gap-2 text-primary ${compact ? "text-sm" : ""}`}>
          <BarChart3 className={compact ? "h-4 w-4" : "h-5 w-5"} />
          Historique & statistiques
        </CardTitle>
        <div className={`flex items-center gap-2 text-muted-foreground mt-1 flex-wrap ${compact ? "text-[10px]" : "text-xs"}`}>
          <span className="flex items-center gap-1">☀️ Matin</span>
          <span className="flex items-center gap-1">🌤️ Midi</span>
          <span className="flex items-center gap-1">🌙 Soir</span>
          <span className="flex items-center gap-1"><span className="text-destructive font-bold">+</span> Supplément</span>
        </div>
      </CardHeader>
      <CardContent className={compact ? "space-y-2 py-2 px-3" : "space-y-4"}>
        <div className={`flex flex-col items-start gap-2 bg-muted/20 rounded-lg ${compact ? "p-2" : "p-4 md:flex-row md:items-center md:justify-between md:gap-3"}`}>
          <div className={compact ? "text-[11px]" : "text-sm"}>
            <div className="font-semibold text-foreground">Entrées : {history.length}</div>
            <div className="text-muted-foreground mt-0.5">
              {sevenDaySummary.count > 0 
                ? compact 
                  ? `7j: ${sevenDaySummary.avgGly} mg/dL - ${sevenDaySummary.avgDoseAdmin} U` 
                  : `Moyenne 7j: ${sevenDaySummary.avgGly} mg/dL - réelles ${sevenDaySummary.avgDoseReal} U / admin ${sevenDaySummary.avgDoseAdmin} U`
                : "Aucune donnée"}
            </div>
          </div>

          <div className={`flex flex-wrap ${compact ? "gap-1" : "gap-2"}`}>
            <Button onClick={downloadCSV} variant="outline" size={compact ? "sm" : "sm"} className={compact ? "gap-1 h-7 px-2 text-[10px]" : "gap-2"}>
              <Download className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} /> CSV
            </Button>
            <Button onClick={downloadXLSX} variant="outline" size={compact ? "sm" : "sm"} className={compact ? "gap-1 h-7 px-2 text-[10px]" : "gap-2"}>
              <Download className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} /> XLSX
            </Button>
            <Button onClick={downloadJSON} variant="outline" size={compact ? "sm" : "sm"} className={compact ? "gap-1 h-7 px-2 text-[10px]" : "gap-2"}>
              <Download className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} /> JSON
            </Button>
            <Button onClick={onClearHistory} variant="outline" size={compact ? "sm" : "sm"} className={compact ? "gap-1 h-7 px-2 text-[10px]" : "gap-2"}>
              <RotateCcw className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} /> Vider
            </Button>
          </div>
        </div>

        <div className={`space-y-1.5 overflow-auto hide-scrollbar ${compact ? "max-h-[45vh]" : "max-h-64"}`}>
          {history.length === 0 ? (
            <div className={`text-muted-foreground text-center ${compact ? "py-4 text-xs" : "py-8 text-sm"}`}>Aucun calcul enregistré</div>
          ) : (
            history.map((h) => (
              <div key={h.id} className={`rounded-lg bg-card/50 border border-border/50 hover:bg-card/80 transition-colors ${compact ? "p-2" : "p-3"}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <div className={`text-muted-foreground ${compact ? "text-[10px]" : "text-xs"}`}>
                    {momentIcon(h.moment)} {new Date(h.dateISO).toLocaleString("fr-FR", compact ? { 
                      day: "2-digit", 
                      month: "2-digit", 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    } : undefined)}
                  </div>
                </div>
                <div className={`font-medium text-foreground ${compact ? "text-xs" : "text-sm"}`}>{h.display}</div>
                <div className={`text-muted-foreground mt-0.5 ${compact ? "text-[10px]" : "text-xs"}`}>
                  Admin: {h.totalAdministered} U - Calc: {Number(h.totalCalculated.toFixed(1))} U
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
