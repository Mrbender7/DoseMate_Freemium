import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { useLanguage } from "../../contexts/LanguageContext";

interface MealParametersSettingsProps {
  carbRatio: number;
  onCarbRatioChange: (value: number) => void;
}

export function MealParametersSettings({
  carbRatio,
  onCarbRatioChange,
}: MealParametersSettingsProps) {
  const { t } = useLanguage();

  return (
    <Card className="transition-all duration-300">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-1.5 text-primary text-base">
          <span className="leading-tight">
            Paramètres<br />repas
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            🥐 Ratio Insuline/Glucides (g)
          </label>
          <Input
            type="number"
            inputMode="numeric"
            value={String(carbRatio)}
            onChange={(e) => {
              const value = Math.max(1, Number(e.target.value) || 10);
              onCarbRatioChange(value);
            }}
            placeholder="ex : 10"
            className="mt-0.5 h-9 text-sm"
          />
        </div>

        <div className="text-[10px] text-muted-foreground bg-muted/30 p-2 rounded-lg">
          <p>💡 Ce ratio unique s'applique à tous les repas.</p>
          <p className="mt-1">Formule : (Glucides/100g × Poids) ÷ Ratio</p>
          <p className="mt-1">⚠️ Consultez votre endocrinologue avant toute modification.</p>
        </div>
      </CardContent>
    </Card>
  );
}
