/* ============================
   Types
   ============================ */

export interface FoodItem {
  id: string;
  carbsPer100: string;
  weight: string;
}

export interface HistoryEntry {
  id: string;
  dateISO: string;
  display: string;
  glycemia?: number;
  base?: number | null;
  meal?: number | null;
  totalAdministered: number;
  totalCalculated: number;
  moment: MomentKey;
}

export type MomentKey = "morning" | "noon" | "evening" | "extra";

export interface DoseRange {
  min: number;
  max: number;
  doses: Record<MomentKey, number>;
}

export const STORAGE_KEY = "glucoflow_history";
export const STORAGE_META_KEY = "glucoflow_meta";
export const STORAGE_CUSTOM_TABLE_KEY = "glucoflow_customTable";

export const DISPLAY_MAX = 22;
export const MAX_CALCULATED = 25;
export const DEFAULT_CARB_RATIO = 0;

export const DEFAULT_INSULIN_TABLE: DoseRange[] = [
  { min: -Infinity, max: 70, doses: { morning: 0, noon: 0, evening: 0, extra: 0 } },
  { min: 71, max: 100, doses: { morning: 0, noon: 0, evening: 0, extra: 0 } },
  { min: 101, max: 150, doses: { morning: 0, noon: 0, evening: 0, extra: 0 } },
  { min: 151, max: 200, doses: { morning: 0, noon: 0, evening: 0, extra: 0 } },
  { min: 201, max: 250, doses: { morning: 0, noon: 0, evening: 0, extra: 0 } },
  { min: 251, max: 300, doses: { morning: 0, noon: 0, evening: 0, extra: 0 } },
  { min: 301, max: 350, doses: { morning: 0, noon: 0, evening: 0, extra: 0 } },
  { min: 351, max: Infinity, doses: { morning: 0, noon: 0, evening: 0, extra: 0 } },
];
