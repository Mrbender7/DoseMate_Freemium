import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Download, RotateCcw } from "lucide-react";
import { momentIcon, momentLabel } from "@/utils/calculations";
import type { MomentKey } from "@/types/insulin";

interface GlycemiaCardProps {
  glycemia: string;
  carbRatio: number;
  moment: MomentKey;
  llupConnected: boolean;
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
  llupConnected,
  forceExtra,
  onGlycemiaChange,
  onCarbRatioChange,
  onReset,
  onSave,
  onToggleExtra,
}: GlycemiaCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Clock className="h-5 w-5" /> Glycémie & paramètres
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span className="flex items-center gap-1.5">
            {momentIcon(moment)} {momentLabel(moment)}
          </span>
          {llupConnected && <Badge variant="outline" className="text-xs">Auto</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Glycémie (mg/dL) {llupConnected && <span className="text-xs text-green-600">• Auto-remplie</span>}
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
              placeholder={llupConnected ? "Auto-remplie par LibreLinkUp" : "ex : 145"}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Ratio glucides → U</label>
            <Input
              type="number"
              value={String(carbRatio)}
              onChange={(e) => onCarbRatioChange(Math.max(1, Number(e.target.value) || 10))}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button onClick={onReset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </Button>
          <Button onClick={onSave} className="gap-2">
            <Download className="h-4 w-4" />
            Enregistrer (manuel)
          </Button>
          <Button 
            onClick={onToggleExtra}
            variant={forceExtra ? "default" : "outline"}
            className="gap-2"
          >
            <span className="text-destructive font-bold">+</span>
            <span className="text-xs">Suppl.</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
