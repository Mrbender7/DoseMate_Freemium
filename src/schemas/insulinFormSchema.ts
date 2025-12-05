import { z } from "zod";

// Messages d'erreur en français
const errorMessages = {
  fr: {
    required: "Ce champ est requis",
    mustBeNumber: "Doit être un nombre valide",
    mustBePositive: "Doit être supérieur à 0",
    glycemiaMin: "La glycémie doit être supérieure à 0",
    glycemiaMax: "La glycémie doit être inférieure à 600 mg/dL",
    carbRatioMin: "Le ratio doit être supérieur à 0",
    carbRatioMax: "Le ratio doit être inférieur à 100",
    carbsPer100Min: "Les glucides doivent être ≥ 0",
    carbsPer100Max: "Les glucides ne peuvent pas dépasser 100g/100g",
    weightMin: "Le poids doit être ≥ 0",
    weightMax: "Le poids ne peut pas dépasser 2000g",
  },
  en: {
    required: "This field is required",
    mustBeNumber: "Must be a valid number",
    mustBePositive: "Must be greater than 0",
    glycemiaMin: "Blood sugar must be greater than 0",
    glycemiaMax: "Blood sugar must be less than 600 mg/dL",
    carbRatioMin: "Ratio must be greater than 0",
    carbRatioMax: "Ratio must be less than 100",
    carbsPer100Min: "Carbs must be ≥ 0",
    carbsPer100Max: "Carbs cannot exceed 100g/100g",
    weightMin: "Weight must be ≥ 0",
    weightMax: "Weight cannot exceed 2000g",
  },
};

export type Language = "fr" | "en";

export const getErrorMessages = (lang: Language) => errorMessages[lang] || errorMessages.fr;

// Schéma pour un item alimentaire
export const createFoodItemSchema = (lang: Language) => {
  const msg = getErrorMessages(lang);
  return z.object({
    id: z.string(),
    carbsPer100: z.string().refine(
      (val) => val === "" || (!isNaN(parseFloat(val.replace(",", "."))) && parseFloat(val.replace(",", ".")) >= 0),
      { message: msg.carbsPer100Min }
    ).refine(
      (val) => val === "" || parseFloat(val.replace(",", ".")) <= 100,
      { message: msg.carbsPer100Max }
    ),
    weight: z.string().refine(
      (val) => val === "" || (!isNaN(parseFloat(val.replace(",", "."))) && parseFloat(val.replace(",", ".")) >= 0),
      { message: msg.weightMin }
    ).refine(
      (val) => val === "" || parseFloat(val.replace(",", ".")) <= 2000,
      { message: msg.weightMax }
    ),
  });
};

// Schéma principal du formulaire de calcul d'insuline
export const createInsulinFormSchema = (lang: Language) => {
  const msg = getErrorMessages(lang);
  
  return z.object({
    // Glycémie actuelle - optionnelle mais si fournie doit être valide
    glycemia: z.string().refine(
      (val) => {
        if (val === "") return true; // Optionnel
        const num = parseFloat(val.replace(",", "."));
        return !isNaN(num) && num > 0;
      },
      { message: msg.glycemiaMin }
    ).refine(
      (val) => {
        if (val === "") return true;
        const num = parseFloat(val.replace(",", "."));
        return num <= 600;
      },
      { message: msg.glycemiaMax }
    ),
    
    // Ratio insuline/glucides - requis pour le calcul des repas
    carbRatio: z.number()
      .min(0.1, { message: msg.carbRatioMin })
      .max(100, { message: msg.carbRatioMax }),
    
    // Items alimentaires
    foodItems: z.array(createFoodItemSchema(lang)),
  });
};

// Types dérivés du schéma
export type InsulinFormValues = z.infer<ReturnType<typeof createInsulinFormSchema>>;
export type FoodItemFormValues = z.infer<ReturnType<typeof createFoodItemSchema>>;

// Validation individuelle des champs pour affichage en temps réel
export const validateGlycemia = (value: string, lang: Language): string | null => {
  const msg = getErrorMessages(lang);
  if (value === "") return null;
  
  const num = parseFloat(value.replace(",", "."));
  if (isNaN(num)) return msg.mustBeNumber;
  if (num <= 0) return msg.glycemiaMin;
  if (num > 600) return msg.glycemiaMax;
  return null;
};

export const validateCarbRatio = (value: number, lang: Language): string | null => {
  const msg = getErrorMessages(lang);
  if (!Number.isFinite(value)) return msg.mustBeNumber;
  if (value <= 0) return msg.carbRatioMin;
  if (value > 100) return msg.carbRatioMax;
  return null;
};

export const validateFoodItemField = (
  field: "carbsPer100" | "weight",
  value: string,
  lang: Language
): string | null => {
  const msg = getErrorMessages(lang);
  if (value === "") return null;
  
  const num = parseFloat(value.replace(",", "."));
  if (isNaN(num)) return msg.mustBeNumber;
  
  if (field === "carbsPer100") {
    if (num < 0) return msg.carbsPer100Min;
    if (num > 100) return msg.carbsPer100Max;
  } else {
    if (num < 0) return msg.weightMin;
    if (num > 2000) return msg.weightMax;
  }
  return null;
};

// Validation complète pour le calcul
export const canCalculateDose = (
  glycemia: string,
  foodItems: Array<{ carbsPer100: string; weight: string }>,
  carbRatio: number,
  lang: Language
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const msg = getErrorMessages(lang);
  
  // Vérifier si au moins une entrée est fournie
  const hasGlycemia = glycemia.trim() !== "";
  const hasCarbs = foodItems.some(item => 
    item.carbsPer100.trim() !== "" && item.weight.trim() !== ""
  );
  
  if (!hasGlycemia && !hasCarbs) {
    errors.push(lang === "fr" 
      ? "Entrez une glycémie ou des glucides pour calculer"
      : "Enter blood sugar or carbs to calculate"
    );
    return { valid: false, errors };
  }
  
  // Valider la glycémie si fournie
  if (hasGlycemia) {
    const glycemiaError = validateGlycemia(glycemia, lang);
    if (glycemiaError) errors.push(glycemiaError);
  }
  
  // Valider le ratio si des glucides sont fournis
  if (hasCarbs) {
    const ratioError = validateCarbRatio(carbRatio, lang);
    if (ratioError) errors.push(ratioError);
  }
  
  return { valid: errors.length === 0, errors };
};
