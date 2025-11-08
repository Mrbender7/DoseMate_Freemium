import { forwardRef, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Utensils, Plus, Minus } from "lucide-react";
import type { FoodItem } from "../../types/insulin";

interface MealCardProps {
  foodItems: FoodItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof FoodItem, value: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MealCard = forwardRef<HTMLDivElement, MealCardProps>(
  ({ foodItems, onAddItem, onRemoveItem, onUpdateItem, isOpen, onOpenChange }, ref) => {
    return (
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger asChild>
          <Card ref={ref} className="cursor-pointer transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-accent" />
                  <span className="font-medium">Calcul de repas ({foodItems.length})</span>
                </div>
                <div className="text-sm text-muted-foreground">Cliquez pour modifier</div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Card className="transition-all duration-300">
            <CardContent className="space-y-4 pt-6">
              {foodItems.map((it, idx) => (
                <div key={it.id} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-foreground">Aliment {idx + 1}</div>
                    <div className="flex gap-2">
                      {idx === foodItems.length - 1 && (
                        <Button onClick={onAddItem} size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                      {foodItems.length > 1 && (
                        <Button onClick={() => onRemoveItem(it.id)} size="sm" variant="outline" className="h-8 w-8 p-0 hover:bg-destructive/10">
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Glucides / 100g</label>
                      <Input 
                        value={it.carbsPer100} 
                        onChange={(e) => onUpdateItem(it.id, "carbsPer100", e.target.value)} 
                        placeholder="ex : 36" 
                        className="mt-1" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Poids (g)</label>
                      <Input 
                        value={it.weight} 
                        onChange={(e) => onUpdateItem(it.id, "weight", e.target.value)} 
                        placeholder="ex : 250" 
                        className="mt-1" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    );
  }
);

MealCard.displayName = "MealCard";
