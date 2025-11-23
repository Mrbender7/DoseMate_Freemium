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
      <AlertDialogContent className="backdrop-blur-md max-w-3xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-center justify-between mb-6">
            <AlertDialogTitle className="text-xl font-bold">
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
          <AlertDialogDescription className="text-sm leading-relaxed space-y-4">
            {t.onboarding.disclaimer.split('\n\n').map((paragraph, index) => {
              const isTitle = paragraph.startsWith('LEGAL DISCLAIMER') || 
                             paragraph.startsWith('AVERTISSEMENT LÉGAL');
              const isNumberedSection = /^[123]\./.test(paragraph);
              
              if (isTitle) {
                return (
                  <div key={index} className="font-semibold text-base text-center text-foreground pb-2 border-b">
                    {paragraph}
                  </div>
                );
              }
              
              if (isNumberedSection) {
                const [title, ...content] = paragraph.split('\n');
                return (
                  <div key={index} className="bg-muted/30 p-4 rounded-lg border border-border/50">
                    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                    <p className="text-muted-foreground">{content.join(' ')}</p>
                  </div>
                );
              }
              
              return (
                <p key={index} className="text-muted-foreground">
                  {paragraph}
                </p>
              );
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <Button onClick={onAccept} className="w-full h-11 text-base font-medium">
            {t.onboarding.accept}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
