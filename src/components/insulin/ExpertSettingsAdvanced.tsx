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
  return (
    <Card className="transition-all duration-300">
      <CardContent className={compact ? "space-y-2 py-3 px-3" : "space-y-4 pt-6"}>
        <div className={`grid grid-cols-2 ${compact ? "gap-2" : "gap-3 md:grid-cols-3"}`}>
          <div>
            <label className={`font-medium text-muted-foreground block ${compact ? "text-[11px] mb-1" : "text-sm"}`}>
              Sensibilité (mg/dL/U)
            </label>
            <Input
              type="number"
              value={String(sensitivityFactor)}
              onChange={(e) => {
                const v = parseNumberInput(e.target.value);
                onSensitivityChange(Number.isNaN(v) ? "" : v);
              }}
              placeholder="ex: 50"
              className={compact ? "h-8 text-xs" : ""}
            />
          </div>

          <div>
            <label className={`font-medium text-muted-foreground block ${compact ? "text-[11px] mb-1" : "text-sm"}`}>
              Cible Matin
            </label>
            <Input 
              type="number" 
              value={String(targetByMoment.morning)} 
              onChange={(e) => onTargetChange("morning", Number(e.target.value))} 
              className={compact ? "h-8 text-xs" : ""}
            />
          </div>

          <div>
            <label className={`font-medium text-muted-foreground block ${compact ? "text-[11px] mb-1" : "text-sm"}`}>
              Cible Midi
            </label>
            <Input 
              type="number" 
              value={String(targetByMoment.noon)} 
              onChange={(e) => onTargetChange("noon", Number(e.target.value))} 
              className={compact ? "h-8 text-xs" : ""}
            />
          </div>

          <div>
            <label className={`font-medium text-muted-foreground block ${compact ? "text-[11px] mb-1" : "text-sm"}`}>
              Cible Soir
            </label>
            <Input 
              type="number" 
              value={String(targetByMoment.evening)} 
              onChange={(e) => onTargetChange("evening", Number(e.target.value))} 
              className={compact ? "h-8 text-xs" : ""}
            />
          </div>

          <div>
            <label className={`font-medium text-muted-foreground block ${compact ? "text-[11px] mb-1" : "text-sm"}`}>
              Cible Extra
            </label>
            <Input 
              type="number" 
              value={String(targetByMoment.extra)} 
              onChange={(e) => onTargetChange("extra", Number(e.target.value))} 
              className={compact ? "h-8 text-xs" : ""}
            />
          </div>
        </div>

        <div className={`text-muted-foreground bg-muted/30 rounded-lg ${compact ? "text-[10px] p-2" : "text-xs p-3"}`}>
          <p>⚠️ Paramètres personnels. Consultez votre endocrinologue avant modification.</p>
          <p className={compact ? "mt-1" : "mt-2"}>La correction ne s'applique qu'en mode Expert.</p>
        </div>
      </CardContent>
    </Card>
  );
}
