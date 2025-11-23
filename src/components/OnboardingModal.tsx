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
      <AlertDialogContent className="backdrop-blur-md max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-center justify-between mb-3">
            <AlertDialogTitle className="text-base font-bold">
              {t.onboarding.title}
            </AlertDialogTitle>
            <div className="flex gap-1.5">
              <Button
                variant={language === "fr" ? "default" : "outline"}
                size="sm"
                onClick={() => handleLanguageChange("fr")}
                className="h-7 px-2.5 text-[10px]"
              >
                🇫🇷 FR
              </Button>
              <Button
                variant={language === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => handleLanguageChange("en")}
                className="h-7 px-2.5 text-[10px]"
              >
                🇬🇧 EN
              </Button>
            </div>
          </div>
          <AlertDialogDescription className="text-xs leading-tight space-y-2">
            {t.onboarding.disclaimer.split('\n\n').map((paragraph, index) => {
              const isTitle = paragraph.startsWith('LEGAL DISCLAIMER') || 
                             paragraph.startsWith('AVERTISSEMENT LÉGAL');
              const isNumberedSection = /^[123]\./.test(paragraph);
              
              if (isTitle) {
                return (
                  <div key={index} className="font-semibold text-[11px] text-center text-foreground pb-1.5 border-b">
                    {paragraph}
                  </div>
                );
              }
              
              if (isNumberedSection) {
                const [title, ...content] = paragraph.split('\n');
                return (
                  <div key={index} className="bg-muted/30 p-2.5 rounded border border-border/50">
                    <h3 className="font-semibold text-foreground mb-1 text-[11px]">{title}</h3>
                    <p className="text-muted-foreground text-[10px] leading-snug">{content.join(' ')}</p>
                  </div>
                );
              }
              
              return (
                <p key={index} className="text-muted-foreground text-[10px]">
                  {paragraph}
                </p>
              );
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-3 flex-col gap-2">
          <a 
            href="https://mrbender7.github.io/glucoflow-docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-primary hover:text-primary/80 transition-colors underline text-center"
          >
            {t.onboarding.privacyLink}
          </a>
          <Button onClick={onAccept} className="w-full h-9 text-sm font-medium">
            {t.onboarding.accept}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
