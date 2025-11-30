import { forwardRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";
import { Utensils, AlertTriangle, Calculator } from "lucide-react";
import { momentIcon, momentLabel, doseStyleClass } from "../../utils/calculations";
import type { MomentKey } from "../../types/insulin";
import { useLanguage } from "../../contexts/LanguageContext";

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
  pulse?: boolean;
}

export const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  ({ calculation, pulse = false }, ref) => {
    const { t, language } = useLanguage();
    const [showAlertAnimation, setShowAlertAnimation] = useState(false);
    
    // Guard against undefined translations
    if (!t || !t.result) {
      return null;
    }
    
    // Contrôler la durée du clignotement de l'alerte (3 secondes)
    useEffect(() => {
      if (calculation.alertMax) {
        setShowAlertAnimation(true);
        const timer = setTimeout(() => {
          setShowAlertAnimation(false);
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        setShowAlertAnimation(false);
      }
    }, [calculation.alertMax]);
    
    const r = calculation;
    const parts: string[] = [];
    if (r.base !== null && r.base !== undefined) parts.push(`${r.base}u ${t.result.base}`);
    if (r.correction !== null && r.correction !== undefined) parts.push(`${r.correction}u ${t.result.correction}`);
    if (r.meal !== null && r.meal !== undefined) parts.push(`${r.meal}u ${t.result.meal}`);
    
    let display = "";
    if (parts.length > 0) {
      display = parts.join(" + ") + " = ";
    }
    display += `${r.totalAdministered}u ${t.result.administered}`;
    
    if (r.alertMax && r.totalCalculated !== undefined) {
      display += ` (${t.result.actual} ${Number(r.totalCalculated.toFixed(1))}u)`;
    }
    const resultDisplay = display;

    // Effet glow utilisant la couleur primaire du thème
    const glowEffect = pulse ? "animate-pulse shadow-[0_0_30px_hsl(var(--primary)/0.5)]" : "";
    
    // Alerte visuelle pour dépassement de dose maximale (clignotement limité à 3 secondes)
    const alertBorder = r.alertMax 
      ? `border-destructive ${showAlertAnimation ? "animate-pulse" : ""}` 
      : "border-primary/20";

    return (
      <Card ref={ref} className={`border-2 ${alertBorder} transition-all duration-300`}>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-1.5 text-primary text-base">
          <Calculator className="h-4 w-4" />
          {t.result.title}
        </CardTitle>
      </CardHeader>
        <CardContent className="space-y-1.5 px-3 pb-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1.5">{t.result.totalDose}</p>
            <div className={`p-2 md:p-3 rounded-lg inline-block ${doseStyleClass(calculation.totalAdministered)} transition-all duration-500 ${glowEffect} relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700`}>
              <div className="font-bold text-3xl md:text-4xl text-foreground">{calculation.totalAdministered} u</div>
              <div className="text-[10px] opacity-70 mt-0.5">{t.result.roundedInfo}</div>
            </div>

            {calculation.alertMax && (
              <div className="mt-2">
                <Alert className="border-destructive bg-destructive/10 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  <AlertDescription className="text-destructive font-semibold text-xs">
                    {t.result.highDoseAlert}
                    <div className="text-[10px] text-destructive/80 mt-0.5">
                      {t.result.calculatedDoseInfo} {Number(calculation.totalCalculated.toFixed(1))} u
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {!calculation.alertMax && calculation.note && (
              <div className="text-[10px] text-muted-foreground mt-1.5">{calculation.note}</div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
            <div className="text-center p-1.5 bg-muted/30 rounded-lg">
              <div className="text-[10px] text-muted-foreground mb-0.5">{t.result.moment}</div>
              <Badge variant="secondary" className="text-xs h-6">
                {momentIcon(calculation.moment)} {momentLabel(calculation.moment, language)}
              </Badge>
            </div>

            <div className="text-center p-1.5 bg-muted/30 rounded-lg">
              <div className="text-[10px] text-muted-foreground mb-0.5">{t.result.protocolDose}</div>
              <div className="font-mono text-xl font-bold text-foreground">{calculation.base ?? "-"} u</div>
            </div>

            <div className="text-center p-1.5 bg-muted/30 rounded-lg">
              <div className="text-[10px] text-muted-foreground mb-0.5">{t.result.mealDose}</div>
              <div className="font-mono text-xl font-bold text-foreground">{calculation.meal ?? "-"} u</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ResultCard.displayName = "ResultCard";
