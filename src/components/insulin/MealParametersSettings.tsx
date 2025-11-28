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
          <span className="leading-tight" dangerouslySetInnerHTML={{ __html: t.expert.mealParametersTitle.replace('\n', '<br />') }} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            {t.expert.carbRatioLabel}
          </label>
          <Input
            type="number"
            inputMode="decimal"
            value={String(carbRatio)}
            onChange={(e) => {
              const value = Math.max(1, Number(e.target.value) || 10);
              onCarbRatioChange(value);
            }}
            placeholder={t.expert.carbRatioPlaceholder}
            className="mt-0.5 h-9 text-sm"
          />
        </div>

        <div className="text-[10px] text-muted-foreground bg-muted/30 p-2 rounded-lg">
          <p>{t.expert.mealNoteInfo}</p>
          <p className="mt-1">{t.expert.mealNoteFormula}</p>
          <p className="mt-1">{t.expert.mealNoteWarning}</p>
        </div>
      </CardContent>
    </Card>
  );
}
