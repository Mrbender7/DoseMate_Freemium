import { forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";
import { Utensils, AlertTriangle } from "lucide-react";
import { momentIcon, momentLabel, doseStyleClass } from "../../utils/calculations";
import type { MomentKey } from "../../types/insulin";

interface Calculation {
  moment: MomentKey;
  base: number | null;
  correction: number | null;
  meal: number | null;
  totalCalculated: number;
  totalAdministered: number;
  hypo?: boolean;
  alertMax?: boolean;
  note: string | null;
}

interface ResultCardProps {
  calculation: Calculation;
  onScrollToMeal: () => void;
  pulse?: boolean;
}

export const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  ({ calculation, onScrollToMeal, pulse = false }, ref) => {
    const r = calculation;
    const parts: string[] = [];
    if (r.base !== null && r.base !== undefined) parts.push(`${r.base}u base`);
    if (r.correction !== null && r.correction !== undefined) parts.push(`${r.correction}u corr`);
    if (r.meal !== null && r.meal !== undefined) parts.push(`${r.meal}u repas`);
    parts.push(`= ${r.totalAdministered}u (admin.)`);
    if (r.alertMax && r.totalCalculated !== undefined) {
      parts.push(`(réelle ${Number(r.totalCalculated.toFixed(1))}u)`);
    }
    const resultDisplay = parts.join(" + ");

    return (
      <Card ref={ref} className={`shadow-xl border-2 border-primary/20 transition-all duration-500 ${pulse ? 'animate-pulse ring-4 ring-primary/30 shadow-[0_0_30px_rgba(59,130,246,0.4)]' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-primary">Résultat du calcul</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="text-center p-2 md:p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Moment</div>
              <Badge variant="secondary" className="text-base">
                {momentIcon(calculation.moment)} {momentLabel(calculation.moment)}
              </Badge>
            </div>

            <div className="text-center p-2 md:p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Dose protocole</div>
              <div className="font-mono text-2xl font-bold text-foreground">{calculation.base ?? "-"} U</div>
            </div>

            <div className="text-center p-2 md:p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Dose repas</div>
              <div className="font-mono text-2xl font-bold text-foreground">{calculation.meal ?? "-"} U</div>
            </div>
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2 md:mb-3">Dose totale à administrer</p>
            <div className={`p-4 md:p-6 rounded-2xl inline-block ${doseStyleClass(calculation.totalAdministered)} transition-all duration-300`}>
              <div className="font-bold text-5xl md:text-6xl text-foreground">{calculation.totalAdministered} U</div>
              <div className="text-xs opacity-70 mt-2">Arrondi à l'unité la plus proche</div>
            </div>

            {calculation.alertMax && (
              <div className="mt-4">
                <Alert className="border-destructive bg-destructive/10">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive font-semibold">
                    Dose élevée détectée — vérifiez avec votre endocrinologue.
                  </AlertDescription>
                </Alert>

                <div className="text-xs text-muted-foreground mt-2">
                  <span>💡 <strong>Dose calculée exacte :</strong> {Number(calculation.totalCalculated.toFixed(1))} U (historique enregistre la dose réelle).</span>
                </div>
              </div>
            )}

            {!calculation.alertMax && calculation.note && (
              <div className="text-xs text-muted-foreground mt-2">{calculation.note}</div>
            )}
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={onScrollToMeal}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Utensils className="h-4 w-4" />
              Ajout d'aliment(s)
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ResultCard.displayName = "ResultCard";
