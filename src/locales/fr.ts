export const fr = {
  // Onboarding
  onboarding: {
    title: "Avertissement Important",
    disclaimer: "GlucoFlow est exclusivement un outil d'aide au calcul mathématique. Cette application ne constitue pas un dispositif médical et ne remplace en aucun cas l'avis d'un médecin ou d'un professionnel de santé. Les ratios insuline/glucides et les objectifs glycémiques sont configurés sous votre seule et entière responsabilité. En cliquant sur 'J'accepte', vous reconnaissez utiliser cet outil à vos propres risques et déchargez les développeurs de toute responsabilité concernant les décisions thérapeutiques.",
    accept: "J'ai lu et j'accepte",
  },
  
  // Header
  header: {
    title: "GlucoFlow",
    subtitle: "Calculateur insuline lispro",
    modeSimple: "Simple",
    modeExpert: "Expert",
    lightMode: "Mode clair activé",
    darkMode: "Mode sombre activé",
    expertModeOn: "Mode expert activé",
    expertModeOff: "Mode simplifié activé",
  },
  
  // Tabs
  tabs: {
    glycemia: "Glycémie",
    meal: "Repas",
    expert: "Exp.",
    result: "Résultat",
    history: "Historique",
  },
  
  // Glycemia Card
  glycemia: {
    title: "Glycémie",
    label: "Glycémie (mg/dL)",
    placeholder: "ex : 145",
    carbRatio: "Ratio glucides → U",
    reset: "Réinitialiser",
    save: "Enregistrer",
    supplement: "Suppl.",
    hypoAlert: "Hypoglycémie détectée ({value} mg/dL). Traitez immédiatement et consultez un professionnel.",
  },
  
  // Meal Card
  meal: {
    title: "Repas & Glucides",
    carbsPer100: "Glucides /100g",
    weight: "Poids (g)",
    add: "Ajouter un aliment",
    total: "Total glucides",
    saveToResult: "Voir le résultat",
  },
  
  // Result Card
  result: {
    title: "Résultat",
    base: "base",
    correction: "corr",
    meal: "repas",
    administered: "(admin.)",
    actual: "réelle",
    maxAlert: "Dose calculée supérieure à la dose max administrable",
  },
  
  // Expert Settings
  expert: {
    sensitivity: "Facteur de sensibilité",
    sensitivityHelp: "1 unité fait baisser la glycémie de",
    targets: "Objectifs glycémiques par moment",
    morning: "Matin",
    noon: "Midi",
    evening: "Soir",
    extra: "Extra",
    parametersTab: "Paramètres",
    tableTab: "Tableau",
    useCustomTable: "Utiliser le tableau personnalisé",
    lockTable: "Verrouiller",
    unlockTable: "Déverrouiller",
    tableExplanation: "Ce tableau contient vos doses de base personnalisées par votre endocrinologue. Cliquez sur le cadenas pour le modifier.",
    glycemiaRange: "Plage glycémie",
  },
  
  // History
  history: {
    title: "Historique",
    clear: "Effacer tout",
    cleared: "Historique effacé",
    deleted: "Entrée supprimée",
    empty: "Aucun calcul enregistré",
  },
  
  // Toasts
  toasts: {
    saved: "Calcul enregistré",
    autoSaved: "Calcul enregistré (auto)",
    autoUpdated: "Calcul mis à jour (auto)",
    supplementCancelled: "Mode supplément annulé (aucune glycémie)",
    supplementOn: "Mode supplément forcé",
    supplementOff: "Mode auto activé",
    configureFirst: "Veuillez d'abord configurer vos ratios dans les paramètres",
  },
  
  // Footer
  footer: {
    warning: "Outil de calcul uniquement. Ne remplace pas un avis médical. Vérifiez toujours la cohérence des résultats avant administration.",
    copyright: "All rights reserved",
    privacy: "Confidentialité",
  },
  
  // Privacy Modal
  privacy: {
    title: "Confidentialité",
    content1: "Cette application ne collecte, ne stocke ni ne transmet aucune donnée personnelle ou médicale à des serveurs externes. Toutes les informations sont uniquement enregistrées localement sur votre appareil, garantissant la confidentialité totale de vos données.",
    content2: "Pour renforcer votre sécurité, toutes vos données personnelles et médicales sont entièrement chiffrées localement sur votre appareil à l'aide d'un algorithme de chiffrement AES-256. Les opérations de chiffrement et de déchiffrement sont effectuées de manière transparente, sans intervention de votre part, assurant ainsi une protection complète de vos informations sensibles.",
    close: "Fermer",
  },
  
  // Moments
  moments: {
    morning: "Matin",
    noon: "Midi",
    evening: "Soir",
    extra: "Extra",
  },
} as const;
