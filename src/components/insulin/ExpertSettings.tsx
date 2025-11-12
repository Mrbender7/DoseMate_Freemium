import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { RotateCcw } from "lucide-react";
import { parseNumberInput } from "../../utils/calculations";
import type { MomentKey, DoseRange } from "../../types/insulin";
import { DEFAULT_INSULIN_TABLE } from "../../types/insulin";
import { useState } from "react";

interface ExpertSettingsProps {
  sensitivityFactor: number | "";
  targetByMoment: Record<MomentKey, number>;
  customInsulinTable: DoseRange[];
  useCustomTable: boolean;
  onSensitivityChange: (value: number | "") => void;
  onTargetChange: (moment: MomentKey, value: number) => void;
  onCustomTableChange: (table: DoseRange[]) => void;
  onToggleCustomTable: () => void;
  showToast: (message: string) => void;
}

export function ExpertSettings({
  sensitivityFactor,
  targetByMoment,
  customInsulinTable,
  useCustomTable,
  onSensitivityChange,
  onTargetChange,
  onCustomTableChange,
  onToggleCustomTable,
  showToast,
}: ExpertSettingsProps) {
  const [selectedMoment, setSelectedMoment] = useState<MomentKey>("morning");

  const momentLabels: Record<MomentKey, string> = {
    morning: "☀️ Matin",
    noon: "🌤️ Midi",
    evening: "🌙 Soir",
    extra: "+ Extra"
  };

  return (
    <Card className="transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">Paramètres avancés (Expert)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Sensibilité (mg/dL / U)</label>
            <Input
              type="number"
              value={String(sensitivityFactor)}
              onChange={(e) => {
                const v = parseNumberInput(e.target.value);
                onSensitivityChange(Number.isNaN(v) ? "" : v);
              }}
              placeholder="ex : 50"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Cible Matin (mg/dL)</label>
            <Input 
              type="number" 
              value={String(targetByMoment.morning)} 
              onChange={(e) => onTargetChange("morning", Number(e.target.value))} 
              className="mt-1" 
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Cible Midi (mg/dL)</label>
            <Input 
              type="number" 
              value={String(targetByMoment.noon)} 
              onChange={(e) => onTargetChange("noon", Number(e.target.value))} 
              className="mt-1" 
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Cible Soir (mg/dL)</label>
            <Input 
              type="number" 
              value={String(targetByMoment.evening)} 
              onChange={(e) => onTargetChange("evening", Number(e.target.value))} 
              className="mt-1" 
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Cible Extra (mg/dL)</label>
            <Input 
              type="number" 
              value={String(targetByMoment.extra)} 
              onChange={(e) => onTargetChange("extra", Number(e.target.value))} 
              className="mt-1" 
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p>⚠️ Ces paramètres sont personnels. Consultez votre endocrinologue avant toute modification.</p>
          <p className="mt-2">La correction glycémique ne s'applique que lorsque le mode Expert est activé.</p>
        </div>

        <Separator className="my-6" />

        {/* Custom Protocol Table */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-foreground">Tableau de protocole personnalisé</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={onToggleCustomTable}
                variant={useCustomTable ? "default" : "outline"}
                size="sm"
              >
                {useCustomTable ? "✓ Tableau personnalisé" : "Tableau par défaut"}
              </Button>
              <Button
                onClick={() => {
                  onCustomTableChange([...DEFAULT_INSULIN_TABLE]);
                  showToast("Tableau réinitialisé aux valeurs par défaut");
                }}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Desktop Table - hidden on mobile */}
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

          {/* Mobile Table - visible only on mobile */}
          <div className="md:hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-2 text-left text-sm font-semibold">Plage glycémie</th>
                    <th className="border border-border p-2 text-center text-sm font-semibold">
                      <select
                        value={selectedMoment}
                        onChange={(e) => setSelectedMoment(e.target.value as MomentKey)}
                        className="w-full p-1 rounded border border-border bg-background text-foreground text-sm font-semibold shadow-sm focus:ring-2 focus:ring-primary focus:border-primary z-50"
                      >
                        <option value="morning">☀️ Matin</option>
                        <option value="noon">🌤️ Midi</option>
                        <option value="evening">🌙 Soir</option>
                        <option value="extra">+ Extra</option>
                      </select>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customInsulinTable.map((range, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="border border-border p-2 text-sm whitespace-nowrap">
                        {range.min === -Infinity ? "≤" : range.min} - {range.max === Infinity ? "∞" : range.max} mg/dL
                      </td>
                      <td className="border border-border p-2">
                        <Input
                          type="number"
                          min="0"
                          value={range.doses[selectedMoment]}
                          onChange={(e) => {
                            const newTable = [...customInsulinTable];
                            newTable[idx].doses[selectedMoment] = Number(e.target.value) || 0;
                            onCustomTableChange(newTable);
                          }}
                          className="w-full max-w-[100px] mx-auto text-center"
                          disabled={!useCustomTable}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <p>💡 Active le tableau personnalisé pour modifier les doses du protocole insuline lispro.</p>
            <p className="mt-1">Les modifications sont sauvegardées automatiquement dans votre navigateur.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
