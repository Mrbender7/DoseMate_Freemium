import { useLanguage, Language } from "../contexts/LanguageContext";
import { Button } from "./ui/button";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang: Language = language === "fr" ? "en" : "fr";
    setLanguage(newLang);
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="sm"
      className="gap-1.5 px-2 h-8 min-w-[80px] glass-button-sm"
    >
      <span className="text-base">{language === "fr" ? "🇫🇷" : "🇬🇧"}</span>
      <span className="text-xs font-medium">{language.toUpperCase()}</span>
    </Button>
  );
}
