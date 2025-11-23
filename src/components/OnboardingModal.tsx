import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useLanguage, Language } from "../contexts/LanguageContext";

interface OnboardingModalProps {
  open: boolean;
  onAccept: () => void;
}

export function OnboardingModal({ open, onAccept }: OnboardingModalProps) {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="backdrop-blur-md max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center justify-between mb-4">
            <AlertDialogTitle className="text-lg font-bold">
              {t.onboarding.title}
            </AlertDialogTitle>
            <div className="flex gap-2">
              <Button
                variant={language === "fr" ? "default" : "outline"}
                size="sm"
                onClick={() => handleLanguageChange("fr")}
                className="h-8 px-3 text-xs"
              >
                🇫🇷 FR
              </Button>
              <Button
                variant={language === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => handleLanguageChange("en")}
                className="h-8 px-3 text-xs"
              >
                🇬🇧 EN
              </Button>
            </div>
          </div>
          <AlertDialogDescription className="text-sm leading-relaxed pt-2">
            {t.onboarding.disclaimer}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onAccept} className="w-full">
            {t.onboarding.accept}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
