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
    
    let display = "";
    if (parts.length > 0) {
      display = parts.join(" + ") + " = ";
    }
    display += `${r.totalAdministered}u (admin.)`;
    
    if (r.alertMax && r.totalCalculated !== undefined) {
      display += ` (réelle ${Number(r.totalCalculated.toFixed(1))}u)`;
    }
    const resultDisplay = display;

    // Déterminer la couleur du glow en fonction de la dose
    let glowEffect = "";
    if (pulse) {
      if (r.totalAdministered <= 15) {
        glowEffect = "animate-pulse shadow-[0_0_30px_rgba(34,197,94,0.5)]";
      } else if (r.totalAdministered <= 18) {
        glowEffect = "animate-pulse shadow-[0_0_30px_rgba(234,179,8,0.5)]";
      } else {
        glowEffect = "animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]";
      }
    }

    return (
      <Card ref={ref} className="border-2 border-primary/20 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          Résultat du calcul
        </CardTitle>
      </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            <div className="text-center p-2 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-0.5">Moment</div>
              <Badge variant="secondary" className="text-base">
                {momentIcon(calculation.moment)} {momentLabel(calculation.moment)}
              </Badge>
            </div>

            <div className="text-center p-2 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-0.5">Dose protocole</div>
              <div className="font-mono text-2xl font-bold text-foreground">{calculation.base ?? "-"} U</div>
            </div>

            <div className="text-center p-2 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-0.5">Dose repas</div>
              <div className="font-mono text-2xl font-bold text-foreground">{calculation.meal ?? "-"} U</div>
            </div>
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Dose totale à administrer</p>
            <div className={`p-3 md:p-4 rounded-xl inline-block ${doseStyleClass(calculation.totalAdministered)} transition-all duration-500 ${glowEffect} relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700`}>
              <div className="font-bold text-4xl md:text-5xl text-foreground">{calculation.totalAdministered} U</div>
              <div className="text-xs opacity-70 mt-1">Arrondi à l'unité la plus proche</div>
            </div>

            {calculation.alertMax && (
              <div className="mt-4">
                <Alert className="border-destructive bg-destructive/10">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive font-semibold">
                    Dose élevée détectée - vérifiez avec votre endocrinologue.
                    <div className="text-xs text-destructive/80 mt-1">
                      💡 <strong>Dose calculée exacte :</strong> {Number(calculation.totalCalculated.toFixed(1))} U (historique enregistre la dose réelle).
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {!calculation.alertMax && calculation.note && (
              <div className="text-xs text-muted-foreground mt-2">{calculation.note}</div>
            )}
          </div>

          <div className="flex justify-center pt-2">
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
