import type { MomentKey } from "@/types/insulin";

/* ============================
   Helper utils
   ============================ */

export function nowISO() {
  return new Date().toISOString();
}

export function uid(seed = "") {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
    return (crypto as any).randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${seed}`;
}

export function parseNumberInput(raw?: string | number) {
  if (raw === "" || raw === undefined || raw === null) return NaN;
  const s = String(raw).trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

export function getMomentOfDay(date = new Date()): MomentKey {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 16) return "noon";
  if (hour >= 16 && hour < 22) return "evening";
  return "extra";
}

export const momentIcon = (m: MomentKey) => {
  if (m === "morning") return "☀️";
  if (m === "noon") return "🌤️";
  if (m === "evening") return "🌙";
  return "+";
};

export const momentLabel = (m: MomentKey) => {
  if (m === "morning") return "Matin";
  if (m === "noon") return "Midi";
  if (m === "evening") return "Soir";
  return "Extra";
};

export const doseStyleClass = (total: number) => {
  if (total <= 15) return "dose-safe";
  if (total <= 18) return "dose-caution";
  return "dose-danger";
};
