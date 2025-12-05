import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Crown, Star, Palette, History, Moon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { PREMIUM_URL } from "../config/freemium";

interface ConversionModalProps {
  open: boolean;
  onClose: () => void;
}

export function ConversionModal({ open, onClose }: ConversionModalProps) {
  const { language } = useLanguage();

  const content = {
    fr: {
      title: "Passez à DoseMate Premium",
      description: "Vous utilisez DoseMate depuis 48 heures. Débloquez toutes les fonctionnalités pour une meilleure gestion de votre diabète !",
      features: [
        { icon: History, text: "Historique complet des doses" },
        { icon: Palette, text: "Thèmes de couleurs personnalisés" },
        { icon: Moon, text: "Mode clair / sombre" },
      ],
      upgrade: "Passer à Premium",
      later: "Plus tard",
    },
    en: {
      title: "Upgrade to DoseMate Premium",
      description: "You've been using DoseMate for 48 hours. Unlock all features for better diabetes management!",
      features: [
        { icon: History, text: "Complete dose history" },
        { icon: Palette, text: "Custom color themes" },
        { icon: Moon, text: "Light / dark mode" },
      ],
      upgrade: "Upgrade to Premium",
      later: "Later",
    },
  };

  const t = content[language] || content.fr;

  const handleUpgrade = () => {
    window.open(PREMIUM_URL, '_blank');
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            {t.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {t.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 my-4">
          {t.features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-accent/50"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">{feature.text}</span>
              <Star className="w-4 h-4 text-amber-500 ml-auto" />
            </div>
          ))}
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold"
          >
            <Crown className="w-4 h-4 mr-2" />
            {t.upgrade}
          </Button>
          <AlertDialogAction asChild>
            <Button variant="ghost" className="w-full" onClick={onClose}>
              {t.later}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
