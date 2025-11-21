import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Clock, Download, RotateCcw } from "lucide-react";
import { momentIcon, momentLabel } from "../../utils/calculations";
import type { MomentKey } from "../../types/insulin";

interface GlycemiaCardProps {
  glycemia: string;
  carbRatio: number;
  moment: MomentKey;
  forceExtra: boolean;
  onGlycemiaChange: (value: string) => void;
  onCarbRatioChange: (value: number) => void;
  onReset: () => void;
  onSave: () => void;
  onToggleExtra: () => void;
}

export function GlycemiaCard({
  glycemia,
  carbRatio,
  moment,
  forceExtra,
  onGlycemiaChange,
  onCarbRatioChange,
  onReset,
  onSave,
  onToggleExtra,
}: GlycemiaCardProps) {
  return (
    <Card className="transition-all duration-300">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-1.5 text-primary text-base">
              <Clock className="h-4 w-4" /> Glycémie
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                {momentIcon(moment)} {momentLabel(moment)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Glycémie (mg/dL)
            </label>
            <Input
              type="number"
              inputMode="numeric"
              value={glycemia}
              onChange={(e) => {
                const value = e.target.value;
                onGlycemiaChange(value);
                if (value.length === 3) (e.target as HTMLInputElement).blur();
              }}
              placeholder="ex : 145"
              className="mt-0.5 h-9 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Ratio glucides → U</label>
            <Input
              type="number"
              value={String(carbRatio)}
              onChange={(e) => onCarbRatioChange(Math.max(1, Number(e.target.value) || 10))}
              className="mt-0.5 h-9 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button onClick={onReset} variant="outline" className="gap-1.5 h-8 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            Réinitialiser
          </Button>
          <Button onClick={onSave} variant="elevated" className="gap-1.5 h-8 text-xs">
            <Download className="h-3.5 w-3.5" />
            Enregistrer
          </Button>
          <Button 
            onClick={onToggleExtra}
            variant={forceExtra ? "default" : "outline"}
            className="gap-1.5 h-8"
          >
            <span className="text-destructive font-bold text-xs">+</span>
            <span className="text-xs">Suppl.</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
