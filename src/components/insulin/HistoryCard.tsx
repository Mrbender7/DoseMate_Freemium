import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Download, RotateCcw } from "lucide-react";
import { momentIcon } from "../../utils/calculations";
import type { HistoryEntry } from "../../types/insulin";
import * as XLSX from "xlsx";

interface HistoryCardProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
  showToast: (message: string) => void;
}

export function HistoryCard({ history, onClearHistory, showToast }: HistoryCardProps) {
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
  
  function downloadCSV() {
    const blob = new Blob([exportCSV()], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "glucoflow_history.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV téléchargé");
  }
  
  function downloadXLSX() {
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
    XLSX.writeFile(wb, "glucoflow_history.xlsx");
    showToast("XLSX téléchargé");
  }
  
  function downloadJSON() {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "glucoflow_history.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("JSON téléchargé");
  }

  return (
    <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <CardTitle>Historique & statistiques</CardTitle>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
          <span className="flex items-center gap-1">☀️ Matin</span>
          <span className="flex items-center gap-1">🌤️ Midi</span>
          <span className="flex items-center gap-1">🌙 Soir</span>
          <span className="flex items-center gap-1"><span className="text-destructive font-bold">+</span> Supplément</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-muted/20 p-4 rounded-lg">
          <div className="text-sm">
            <div className="font-semibold text-foreground">Entrées sauvegardées : {history.length}</div>
            <div className="text-muted-foreground mt-1">
              Moyenne 7 jours : {sevenDaySummary.count > 0 ? `${sevenDaySummary.avgGly} mg/dL - réelles ${sevenDaySummary.avgDoseReal} U / admin ${sevenDaySummary.avgDoseAdmin} U` : "Aucune donnée"}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={downloadCSV} variant="outline" size="sm" className="gap-2">
              <Download className="h-3 w-3" /> CSV
            </Button>
            <Button onClick={downloadXLSX} variant="outline" size="sm" className="gap-2">
              <Download className="h-3 w-3" /> XLSX
            </Button>
            <Button onClick={downloadJSON} variant="outline" size="sm" className="gap-2">
              <Download className="h-3 w-3" /> JSON
            </Button>
            <Button onClick={onClearHistory} variant="outline" size="sm" className="gap-2">
              <RotateCcw className="h-3 w-3" /> Vider
            </Button>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-auto">
          {history.length === 0 ? (
            <div className="text-muted-foreground text-center py-8 text-sm">Aucun calcul enregistré pour le moment</div>
          ) : (
            history.map((h) => (
              <div key={h.id} className="p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-card/80 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-muted-foreground">
                    {momentIcon(h.moment)} {new Date(h.dateISO).toLocaleString("fr-FR")}
                  </div>
                </div>
                <div className="text-sm font-medium text-foreground">{h.display}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Admin : {h.totalAdministered} U - Calculée : {Number(h.totalCalculated.toFixed(1))} U
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
