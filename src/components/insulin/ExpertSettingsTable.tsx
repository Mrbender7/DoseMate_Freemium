import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { RotateCcw, Lock, Unlock } from "lucide-react";
import type { MomentKey, DoseRange } from "../../types/insulin";
import { DEFAULT_INSULIN_TABLE } from "../../types/insulin";
import { hapticFeedback } from "../../utils/hapticFeedback";

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
  const [isLocked, setIsLocked] = useState<boolean>(true);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (value === 0) {
      e.target.value = '';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, callback: () => void) => {
    if (e.target.value === '' || e.target.value === null) {
      callback();
    }
  };

  return (
    <Card className="transition-all duration-300">
      <CardContent className="space-y-2 py-2 px-3">
        <div className="flex flex-wrap gap-1">
          <Button
            onClick={() => {
              hapticFeedback();
              setIsLocked(!isLocked);
            }}
            variant={isLocked ? "outline" : "default"}
            size="sm"
            className="h-7 text-[11px] px-2 gap-1"
            title={isLocked ? "Déverrouiller pour éditer" : "Verrouiller le tableau"}
          >
            {isLocked ? (
              <>
                <Lock className="h-3 w-3" />
                Verrouillé
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3" />
                Déverrouillé
              </>
            )}
          </Button>
          <Button
            onClick={onToggleCustomTable}
            variant={useCustomTable ? "default" : "outline"}
            size="sm"
            className="h-7 text-[11px] px-2"
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
            className="h-7 text-[11px] px-2 gap-1"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            Reset
          </Button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-1.5 text-left text-xs font-semibold">Plage glycémie</th>
                <th className="border border-border p-1.5 text-center text-xs font-semibold">☀️ Matin</th>
                <th className="border border-border p-1.5 text-center text-xs font-semibold">🌤️ Midi</th>
                <th className="border border-border p-1.5 text-center text-xs font-semibold">🌙 Soir</th>
                <th className="border border-border p-1.5 text-center text-xs font-semibold">+ Extra</th>
              </tr>
            </thead>
            <tbody>
              {customInsulinTable.map((range, idx) => (
                <tr key={idx} className="hover:bg-muted/20">
                  <td className="border border-border p-1.5 text-xs">
                    {range.min === -Infinity ? "≤" : range.min} - {range.max === Infinity ? "∞" : range.max} mg/dL
                  </td>
                  <td className="border border-border p-1.5">
                    <Input
                      type="number"
                      min="0"
                      value={range.doses.morning}
                      onChange={(e) => {
                        const newTable = [...customInsulinTable];
                        newTable[idx].doses.morning = Number(e.target.value) || 0;
                        onCustomTableChange(newTable);
                      }}
                      onFocus={handleFocus}
                      onBlur={(e) => handleBlur(e, () => {
                        const newTable = [...customInsulinTable];
                        newTable[idx].doses.morning = 0;
                        onCustomTableChange(newTable);
                      })}
                      className="w-16 mx-auto text-center h-8 text-xs"
                      disabled={!useCustomTable || isLocked}
                      readOnly={isLocked}
                    />
                  </td>
                  <td className="border border-border p-1.5">
                    <Input
                      type="number"
                      min="0"
                      value={range.doses.noon}
                      onChange={(e) => {
                        const newTable = [...customInsulinTable];
                        newTable[idx].doses.noon = Number(e.target.value) || 0;
                        onCustomTableChange(newTable);
                      }}
                      onFocus={handleFocus}
                      onBlur={(e) => handleBlur(e, () => {
                        const newTable = [...customInsulinTable];
                        newTable[idx].doses.noon = 0;
                        onCustomTableChange(newTable);
                      })}
                      className="w-16 mx-auto text-center h-8 text-xs"
                      disabled={!useCustomTable || isLocked}
                      readOnly={isLocked}
                    />
                  </td>
                  <td className="border border-border p-1.5">
                    <Input
                      type="number"
                      min="0"
                      value={range.doses.evening}
                      onChange={(e) => {
                        const newTable = [...customInsulinTable];
                        newTable[idx].doses.evening = Number(e.target.value) || 0;
                        onCustomTableChange(newTable);
                      }}
                      onFocus={handleFocus}
                      onBlur={(e) => handleBlur(e, () => {
                        const newTable = [...customInsulinTable];
                        newTable[idx].doses.evening = 0;
                        onCustomTableChange(newTable);
                      })}
                      className="w-16 mx-auto text-center h-8 text-xs"
                      disabled={!useCustomTable || isLocked}
                      readOnly={isLocked}
                    />
                  </td>
                  <td className="border border-border p-1.5">
                    <Input
                      type="number"
                      min="0"
                      value={range.doses.extra}
                      onChange={(e) => {
                        const newTable = [...customInsulinTable];
                        newTable[idx].doses.extra = Number(e.target.value) || 0;
                        onCustomTableChange(newTable);
                      }}
                      onFocus={handleFocus}
                      onBlur={(e) => handleBlur(e, () => {
                        const newTable = [...customInsulinTable];
                        newTable[idx].doses.extra = 0;
                        onCustomTableChange(newTable);
                      })}
                      className="w-16 mx-auto text-center h-8 text-xs"
                      disabled={!useCustomTable || isLocked}
                      readOnly={isLocked}
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
                  <th className="border border-border text-left font-semibold p-1.5 text-[11px]">
                    Plage
                  </th>
                  <th className="border border-border text-center font-semibold p-1.5">
                    <select
                      value={selectedMoment}
                      onChange={(e) => setSelectedMoment(e.target.value as MomentKey)}
                      className="w-full rounded border border-border bg-background text-foreground font-semibold shadow-sm focus:ring-2 focus:ring-primary focus:border-primary p-0.5 text-[10px]"
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
                    <td className="border border-border whitespace-nowrap p-1.5 text-[10px]">
                      {range.min === -Infinity ? "≤" : range.min}-{range.max === Infinity ? "∞" : range.max}
                    </td>
                    <td className="border border-border p-1">
                      <Input
                        type="number"
                        min="0"
                        value={range.doses[selectedMoment]}
                        onChange={(e) => {
                          const newTable = [...customInsulinTable];
                          newTable[idx].doses[selectedMoment] = Number(e.target.value) || 0;
                          onCustomTableChange(newTable);
                        }}
                        onFocus={handleFocus}
                        onBlur={(e) => handleBlur(e, () => {
                          const newTable = [...customInsulinTable];
                          newTable[idx].doses[selectedMoment] = 0;
                          onCustomTableChange(newTable);
                        })}
                        className="w-full mx-auto text-center h-7 text-xs max-w-[70px]"
                        disabled={!useCustomTable || isLocked}
                        readOnly={isLocked}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-[10px] text-muted-foreground bg-muted/30 p-2 rounded-lg">
          <p>💡 Déverrouille puis active le tableau personnalisé pour modifier les doses.</p>
          <p className="mt-1">🔒 Verrouille le tableau après modifications pour éviter les changements accidentels.</p>
        </div>
      </CardContent>
    </Card>
  );
}
