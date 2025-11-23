import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import type { MomentKey } from "../../types/insulin";
import { parseNumberInput } from "../../utils/calculations";

interface ExpertSettingsAdvancedProps {
  sensitivityFactor: number | "";
  targetByMoment: Record<MomentKey, number>;
  onSensitivityChange: (value: number | "") => void;
  onTargetChange: (moment: MomentKey, value: number) => void;
  compact?: boolean;
}

export function ExpertSettingsAdvanced({
  sensitivityFactor,
  targetByMoment,
  onSensitivityChange,
  onTargetChange,
  compact = false,
}: ExpertSettingsAdvancedProps) {
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
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className="font-medium text-muted-foreground block text-[11px] mb-0.5">
              Sensibilité (mg/dL/U)
            </label>
            <Input
              type="number"
              value={String(sensitivityFactor)}
              onChange={(e) => {
                const v = parseNumberInput(e.target.value);
                onSensitivityChange(Number.isNaN(v) ? "" : v);
              }}
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, () => onSensitivityChange(0))}
              placeholder="ex: 50"
              className="h-8 text-xs"
            />
          </div>

          <div>
            <label className="font-medium text-muted-foreground block text-[11px] mb-0.5">
              Cible Matin
            </label>
            <Input 
              type="number" 
              value={String(targetByMoment.morning)} 
              onChange={(e) => onTargetChange("morning", Number(e.target.value))} 
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, () => onTargetChange("morning", 0))}
              className="h-8 text-xs"
            />
          </div>

          <div>
            <label className="font-medium text-muted-foreground block text-[11px] mb-0.5">
              Cible Midi
            </label>
            <Input 
              type="number" 
              value={String(targetByMoment.noon)} 
              onChange={(e) => onTargetChange("noon", Number(e.target.value))} 
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, () => onTargetChange("noon", 0))}
              className="h-8 text-xs"
            />
          </div>

          <div>
            <label className="font-medium text-muted-foreground block text-[11px] mb-0.5">
              Cible Soir
            </label>
            <Input 
              type="number" 
              value={String(targetByMoment.evening)} 
              onChange={(e) => onTargetChange("evening", Number(e.target.value))} 
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, () => onTargetChange("evening", 0))}
              className="h-8 text-xs"
            />
          </div>

          <div>
            <label className="font-medium text-muted-foreground block text-[11px] mb-0.5">
              Cible Extra
            </label>
            <Input 
              type="number" 
              value={String(targetByMoment.extra)} 
              onChange={(e) => onTargetChange("extra", Number(e.target.value))} 
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, () => onTargetChange("extra", 0))}
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="text-muted-foreground bg-muted/30 rounded-lg text-[10px] p-2">
          <p>⚠️ Paramètres personnels. Consultez votre endocrinologue avant modification.</p>
          <p className="mt-1">La correction ne s'applique qu'en mode Expert.</p>
        </div>
      </CardContent>
    </Card>
  );
}
