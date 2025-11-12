import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { RotateCcw } from "lucide-react";
import type { MomentKey, DoseRange } from "../../types/insulin";
import { DEFAULT_INSULIN_TABLE } from "../../types/insulin";

interface ExpertSettingsTableProps {
  customInsulinTable: DoseRange[];
  useCustomTable: boolean;
  onCustomTableChange: (table: DoseRange[]) => void;
  onToggleCustomTable: () => void;
  showToast: (message: string) => void;
  compact?: boolean;
}

export function ExpertSettingsTable({
  customInsulinTable,
  useCustomTable,
  onCustomTableChange,
  onToggleCustomTable,
  showToast,
  compact = false,
}: ExpertSettingsTableProps) {
  const [selectedMoment, setSelectedMoment] = useState<MomentKey>("morning");

  return (
    <Card className="transition-all duration-300">
      <CardContent className={compact ? "space-y-2 py-3 px-3" : "space-y-4 pt-6"}>
        <div className={`flex flex-wrap ${compact ? "gap-1" : "gap-2"}`}>
          <Button
            onClick={onToggleCustomTable}
            variant={useCustomTable ? "default" : "outline"}
            size="sm"
            className={compact ? "h-7 text-[11px] px-2" : ""}
          >
            {useCustomTable ? "✓ Personnalisé" : "Par défaut"}
          </Button>
          <Button
            onClick={() => {
              onCustomTableChange([...DEFAULT_INSULIN_TABLE]);
              showToast("Tableau réinitialisé");
            }}
            variant="outline"
            size="sm"
            className={compact ? "h-7 text-[11px] px-2 gap-1" : ""}
          >
            <RotateCcw className={compact ? "h-2.5 w-2.5" : "h-4 w-4"} />
            Reset
          </Button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-2 text-left text-sm font-semibold">Plage glycémie</th>
                <th className="border border-border p-2 text-center text-sm font-semibold">☀️ Matin</th>
                <th className="border border-border p-2 text-center text-sm font-semibold">🌤️ Midi</th>
                <th className="border border-border p-2 text-center text-sm font-semibold">🌙 Soir</th>
                <th className="border border-border p-2 text-center text-sm font-semibold">+ Extra</th>
              </tr>
            </thead>
            <tbody>
              {customInsulinTable.map((range, idx) => (
                <tr key={idx} className="hover:bg-muted/20">
                  <td className="border border-border p-2 text-sm">
                    {range.min === -Infinity ? "≤" : range.min} - {range.max === Infinity ? "∞" : range.max} mg/dL
                  </td>
                  <td className="border border-border p-2">
                    <Input
                      type="number"
                      min="0"
                      value={range.doses.morning}
                      onChange={(e) => {
                        const newTable = [...customInsulinTable];
                        newTable[idx].doses.morning = Number(e.target.value) || 0;
                        onCustomTableChange(newTable);
                      }}
                      className="w-20 mx-auto text-center"
                      disabled={!useCustomTable}
                    />
                  </td>
                  <td className="border border-border p-2">
                    <Input
                      type="number"
                      min="0"
                      value={range.doses.noon}
                      onChange={(e) => {
                        const newTable = [...customInsulinTable];
                        newTable[idx].doses.noon = Number(e.target.value) || 0;
                        onCustomTableChange(newTable);
                      }}
                      className="w-20 mx-auto text-center"
                      disabled={!useCustomTable}
                    />
                  </td>
                  <td className="border border-border p-2">
                    <Input
                      type="number"
                      min="0"
                      value={range.doses.evening}
                      onChange={(e) => {
                        const newTable = [...customInsulinTable];
                        newTable[idx].doses.evening = Number(e.target.value) || 0;
                        onCustomTableChange(newTable);
                      }}
                      className="w-20 mx-auto text-center"
                      disabled={!useCustomTable}
                    />
                  </td>
                  <td className="border border-border p-2">
                    <Input
                      type="number"
                      min="0"
                      value={range.doses.extra}
                      onChange={(e) => {
                        const newTable = [...customInsulinTable];
                        newTable[idx].doses.extra = Number(e.target.value) || 0;
                        onCustomTableChange(newTable);
                      }}
                      className="w-20 mx-auto text-center"
                      disabled={!useCustomTable}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Table */}
        <div className="md:hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className={`border border-border text-left font-semibold ${compact ? "p-1.5 text-[11px]" : "p-2 text-sm"}`}>
                    Plage
                  </th>
                  <th className={`border border-border text-center font-semibold ${compact ? "p-1.5" : "p-2"}`}>
                    <select
                      value={selectedMoment}
                      onChange={(e) => setSelectedMoment(e.target.value as MomentKey)}
                      className={`w-full rounded border border-border bg-background text-foreground font-semibold shadow-sm focus:ring-2 focus:ring-primary focus:border-primary z-50 ${compact ? "p-0.5 text-[10px]" : "p-1 text-sm"}`}
                    >
                      <option value="morning" className="bg-background text-foreground">☀️ Matin</option>
                      <option value="noon" className="bg-background text-foreground">🌤️ Midi</option>
                      <option value="evening" className="bg-background text-foreground">🌙 Soir</option>
                      <option value="extra" className="bg-background text-foreground">+ Extra</option>
                    </select>
                  </th>
                </tr>
              </thead>
              <tbody>
                {customInsulinTable.map((range, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className={`border border-border whitespace-nowrap ${compact ? "p-1.5 text-[10px]" : "p-2 text-sm"}`}>
                      {range.min === -Infinity ? "≤" : range.min}-{range.max === Infinity ? "∞" : range.max}
                    </td>
                    <td className={`border border-border ${compact ? "p-1" : "p-2"}`}>
                      <Input
                        type="number"
                        min="0"
                        value={range.doses[selectedMoment]}
                        onChange={(e) => {
                          const newTable = [...customInsulinTable];
                          newTable[idx].doses[selectedMoment] = Number(e.target.value) || 0;
                          onCustomTableChange(newTable);
                        }}
                        className={`w-full mx-auto text-center ${compact ? "h-7 text-xs max-w-[70px]" : "max-w-[100px]"}`}
                        disabled={!useCustomTable}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`text-muted-foreground bg-muted/30 rounded-lg ${compact ? "text-[10px] p-2" : "text-xs p-3"}`}>
          <p>💡 Active le tableau personnalisé pour modifier les doses.</p>
          <p className={compact ? "mt-0.5" : "mt-1"}>Sauvegarde automatique.</p>
        </div>
      </CardContent>
    </Card>
  );
}
