import { forwardRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Utensils, Plus, Minus } from "lucide-react";
import type { FoodItem } from "../../types/insulin";
import { hapticFeedback } from "../../utils/hapticFeedback";
import { useLanguage } from "../../contexts/LanguageContext";

interface MealCardProps {
  foodItems: FoodItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof FoodItem, value: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveToResult: () => void;
}

export const MealCard = forwardRef<HTMLDivElement, MealCardProps>(
  ({ foodItems, onAddItem, onRemoveItem, onUpdateItem, isOpen, onOpenChange, onSaveToResult }, ref) => {
  const { t } = useLanguage();
  
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Card ref={ref} className="cursor-pointer transition-all duration-300">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="flex items-center gap-1.5 text-primary text-base">
              <Utensils className="h-4 w-4" /> {t.meal.title}
            </CardTitle>
          </CardHeader>
        </Card>
      </CollapsibleTrigger>

        <CollapsibleContent>
          <Card className="transition-all duration-300">
            <CardContent className="space-y-2 pt-3 px-3 pb-3">
              {foodItems.map((it, idx) => (
                <div key={it.id} className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-foreground">{t.meal.foodItem} {idx + 1}</div>
                    <div className="flex gap-1.5">
                      {idx === foodItems.length - 1 && (
                        <Button onClick={onAddItem} size="sm" variant="outline" className="h-7 w-7 p-0">
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {foodItems.length > 1 && (
                        <Button onClick={() => onRemoveItem(it.id)} size="sm" variant="outline" className="h-7 w-7 p-0 hover:bg-destructive/10">
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">🥐 {t.meal.carbsPer100}</label>
                      <Input 
                        value={it.carbsPer100} 
                        onChange={(e) => onUpdateItem(it.id, "carbsPer100", e.target.value)} 
                        placeholder={t.meal.carbsPlaceholder}
                        className="mt-0.5 h-9 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">{t.meal.weight}</label>
                      <Input 
                        value={it.weight} 
                        onChange={(e) => onUpdateItem(it.id, "weight", e.target.value)} 
                        placeholder={t.meal.weightPlaceholder}
                        className="mt-0.5 h-9 text-sm" 
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                onClick={() => {
                  hapticFeedback();
                  onSaveToResult();
                }} 
                className="w-full mt-2 h-8 text-xs"
                variant="elevated"
              >
                {t.meal.save}
              </Button>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    );
  }
);

MealCard.displayName = "MealCard";
