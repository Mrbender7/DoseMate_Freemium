export const en = {
  // Onboarding
  onboarding: {
    title: "Legal Disclaimer",
    disclaimer: "LEGAL DISCLAIMER AND TERMS OF USE (Version 1.0.0)\n\n1. Nature of the Application\n\nDoseMate is exclusively a mathematical calculation aid tool based on formulas and ratios supplied by the user.\n\n2. Medical Limitation\n\nThis application is not a medical device and does not in any way replace the advice, clinical judgment, or supervision of a doctor, endocrinologist, or any qualified healthcare professional. The application is provided \"as is,\" without warranty of any kind, including warranty of accuracy or performance.\n\n3. User Responsibility\n\nInsulin/carb ratios, sensitivity factors, and glycemic targets are personal data configured under your sole and entire responsibility.\n\nBy clicking 'I Accept', you explicitly acknowledge that the use of DoseMate is at your own risk and you formally release the developers from any liability concerning the results, calculation errors, or therapeutic decisions made following the use of the application.",
    privacyLink: "Privacy Policy",
    accept: "I Accept",
  },
  
  // Header
  header: {
    title: "DoseMate",
    subtitle: "Fast-acting insulin calculator",
    modeSimple: "Simple",
    modeExpert: "Expert",
    lightMode: "Light mode enabled",
    darkMode: "Dark mode enabled",
    expertModeOn: "Expert mode enabled",
    expertModeOff: "Simple mode enabled",
    close: "Close",
  },
  
  // Tabs
  tabs: {
    glycemia: "Glucose",
    meal: "Meal",
    expert: "Exp.",
    result: "Result",
    history: "History",
  },
  
  // Glycemia Card
  glycemia: {
    title: "Glucose",
    label: "Glucose (mg/dL)",
    placeholder: "e.g.: 145",
    carbRatio: "Carb ratio → U",
    reset: "Reset",
    save: "Save",
    supplement: "Suppl.",
    hypoAlert: "Hypoglycemia detected ({value} mg/dL). Treat immediately and consult a professional.",
  },
  
  // Meal Card
  meal: {
    title: "Meal",
    carbsPer100: "Carbs /100g",
    weight: "Weight (g)",
    add: "Add food item",
    total: "Total carbs",
    saveToResult: "View result",
    save: "Save",
    foodItem: "Food item",
    carbsPlaceholder: "e.g.: 36",
    weightPlaceholder: "e.g.: 250",
  },
  
  // Result Card
  result: {
    title: "💉 Calculation Result",
    base: "base",
    correction: "corr",
    meal: "meal",
    administered: "(admin.)",
    actual: "actual",
    maxAlert: "Calculated dose exceeds maximum administrable dose",
    totalDose: "Total dose to administer",
    roundedInfo: "Rounded to nearest unit",
    highDoseAlert: "High dose detected - verify with your endocrinologist.",
    calculatedDoseInfo: "💡 Exact calculated dose:",
    moment: "Time",
    protocolDose: "Protocol dose",
    mealDose: "Meal dose",
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
    glycemiaRange: "Glucose range",
    mealParametersTitle: "Meal\nSettings",
    carbRatioLabel: "🥐 Insulin/Carb Ratio (g)",
    carbRatioPlaceholder: "e.g.: 10",
    mealNoteInfo: "💡 This single ratio applies to all meals.",
    mealNoteFormula: "Formula: (Carbs/100g × Weight) ÷ Ratio",
    mealNoteWarning: "⚠️ Consult your endocrinologist before any changes.",
  },
  
  // History
  history: {
    title: "History & Statistics",
    clear: "Clear all",
    cleared: "History cleared",
    deleted: "Entry deleted",
    empty: "No calculations saved",
    entries: "Entries",
    noData: "No data",
    clearShort: "Clear",
    morning: "Morning",
    noon: "Noon",
    evening: "Evening",
    supplement: "Supplement",
    admin: "Admin",
    calc: "Calc",
    deleteEntry: "Delete this entry",
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
    policyLink: "For more details, please read our",
    policyLinkText: "complete Privacy Policy",
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
    resetAllData: "Reset Data",
    resetConfirmTitle: "Confirm Reset",
    resetConfirmDescription: "⚠️ Warning: this action is irreversible. All your data will be permanently deleted.",
    resetConfirmButton: "Confirm Reset",
    resetCancelButton: "Cancel",
  },
} as const;
