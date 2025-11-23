export const en = {
  // Onboarding
  onboarding: {
    title: "Important Disclaimer",
    disclaimer: "GlucoFlow is strictly a mathematical calculation aid tool. This application is not a medical device and does not replace the advice of a doctor or healthcare professional. Insulin/carb ratios and glycemic targets are configured under your sole and entire responsibility. By clicking 'I Accept', you acknowledge using this tool at your own risk and release the developers from any liability regarding therapeutic decisions.",
    accept: "I read and accept",
  },
  
  // Header
  header: {
    title: "GlucoFlow",
    subtitle: "Fast-acting insulin calculator",
    modeSimple: "Simple",
    modeExpert: "Expert",
    lightMode: "Light mode enabled",
    darkMode: "Dark mode enabled",
    expertModeOn: "Expert mode enabled",
    expertModeOff: "Simple mode enabled",
  },
  
  // Tabs
  tabs: {
    glycemia: "Blood Sugar",
    meal: "Meal",
    expert: "Exp.",
    result: "Result",
    history: "History",
  },
  
  // Glycemia Card
  glycemia: {
    title: "Blood Sugar",
    label: "Blood Sugar (mg/dL)",
    placeholder: "e.g.: 145",
    carbRatio: "Carb ratio → U",
    reset: "Reset",
    save: "Save",
    supplement: "Suppl.",
    hypoAlert: "Hypoglycemia detected ({value} mg/dL). Treat immediately and consult a professional.",
  },
  
  // Meal Card
  meal: {
    title: "Meal & Carbs",
    carbsPer100: "Carbs /100g",
    weight: "Weight (g)",
    add: "Add food item",
    total: "Total carbs",
    saveToResult: "View result",
  },
  
  // Result Card
  result: {
    title: "Result",
    base: "base",
    correction: "corr",
    meal: "meal",
    administered: "(admin.)",
    actual: "actual",
    maxAlert: "Calculated dose exceeds maximum administrable dose",
  },
  
  // Expert Settings
  expert: {
    sensitivity: "Sensitivity factor",
    sensitivityHelp: "1 unit lowers blood sugar by",
    targets: "Target blood sugar by time",
    morning: "Morning",
    noon: "Noon",
    evening: "Evening",
    extra: "Extra",
    parametersTab: "Settings",
    tableTab: "Table",
    useCustomTable: "Use custom table",
    lockTable: "Lock",
    unlockTable: "Unlock",
    tableExplanation: "This table contains your base doses personalized by your endocrinologist. Click the lock to edit.",
    glycemiaRange: "Blood sugar range",
  },
  
  // History
  history: {
    title: "History",
    clear: "Clear all",
    cleared: "History cleared",
    deleted: "Entry deleted",
    empty: "No calculations saved",
  },
  
  // Toasts
  toasts: {
    saved: "Calculation saved",
    autoSaved: "Calculation saved (auto)",
    autoUpdated: "Calculation updated (auto)",
    supplementCancelled: "Supplement mode cancelled (no blood sugar)",
    supplementOn: "Supplement mode forced",
    supplementOff: "Auto mode enabled",
    configureFirst: "Please configure your ratios in settings first",
  },
  
  // Footer
  footer: {
    warning: "Calculation tool only. Not medical advice. Always verify result consistency before administration.",
    copyright: "All rights reserved",
    privacy: "Privacy",
  },
  
  // Privacy Modal
  privacy: {
    title: "Privacy",
    content1: "This application does not collect, store or transmit any personal or medical data to external servers. All information is only stored locally on your device, ensuring complete privacy of your data.",
    content2: "To enhance your security, all your personal and medical data is fully encrypted locally on your device using AES-256 encryption algorithm. Encryption and decryption operations are performed transparently, without your intervention, ensuring complete protection of your sensitive information.",
    close: "Close",
  },
  
  // Moments
  moments: {
    morning: "Morning",
    noon: "Noon",
    evening: "Evening",
    extra: "Extra",
  },
  
  // Settings
  settings: {
    version: "Version",
    contactSupport: "Contact Support",
    resetAllData: "Reset All Data",
    resetConfirmTitle: "Confirm Reset",
    resetConfirmDescription: "⚠️ Warning: this action is irreversible. All your data will be permanently deleted.",
    resetConfirmButton: "Confirm Reset",
    resetCancelButton: "Cancel",
  },
} as const;
