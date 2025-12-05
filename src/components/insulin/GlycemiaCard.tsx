import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Clock, Download, RotateCcw } from "lucide-react";
import { momentIcon, momentLabel } from "../../utils/calculations";
import { useLanguage } from "../../contexts/LanguageContext";
import type { MomentKey } from "../../types/insulin";

interface GlycemiaCardProps {
  glycemia: string;
  moment: MomentKey;
  forceExtra: boolean;
  onGlycemiaChange: (value: string) => void;
  onReset: () => void;
  onSave: () => void;
  onToggleExtra: () => void;
  error?: string | null;
}

export function GlycemiaCard({
  glycemia,
  moment,
  forceExtra,
  onGlycemiaChange,
  onReset,
  onSave,
  onToggleExtra,
  error,
}: GlycemiaCardProps) {
  const { t, language } = useLanguage();
  
  return (
    <Card className="transition-all duration-300">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-1.5 text-primary text-base">
              <Clock className="h-4 w-4" /> {t.glycemia.title}
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                {momentIcon(moment)} {momentLabel(moment, language)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            📈 {t.glycemia.label}
          </label>
          <Input
            type="number"
            inputMode="decimal"
            value={glycemia}
            onChange={(e) => {
              const value = e.target.value;
              onGlycemiaChange(value);
              if (value.length === 3) (e.target as HTMLInputElement).blur();
            }}
            placeholder={t.glycemia.placeholder}
            className={`mt-0.5 h-9 text-sm ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          {error && (
            <p className="text-xs text-destructive mt-1">{error}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button onClick={onReset} variant="outline" className="gap-1.5 h-8 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            {t.glycemia.reset}
          </Button>
          <Button onClick={onSave} variant="elevated" className="gap-1.5 h-8 text-xs">
            <Download className="h-3.5 w-3.5" />
            {t.glycemia.save}
          </Button>
          <Button 
            onClick={onToggleExtra}
            variant={forceExtra ? "default" : "outline"}
            className="gap-1.5 h-8"
          >
            <span className="text-destructive font-bold text-xs">+</span>
            <span className="text-xs">{t.glycemia.supplement}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
