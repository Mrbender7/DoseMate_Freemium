import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useLanguage } from "../contexts/LanguageContext";
import { AlertTriangle, Trash2, Database } from "lucide-react";

interface ReinstallCleanupModalProps {
  open: boolean;
  onCleanup: () => void;
  onKeep: () => void;
  isCleaningUp: boolean;
}

export function ReinstallCleanupModal({
  open,
  onCleanup,
  onKeep,
  isCleaningUp,
}: ReinstallCleanupModalProps) {
  const { language } = useLanguage();

  const content = {
    fr: {
      title: "Données précédentes détectées",
      description:
        "DoseMate a détecté des données chiffrées provenant d'une installation précédente. Ces données peuvent contenir des informations sensibles (tableau d'insuline, historique, paramètres).",
      question: "Voulez-vous effacer ces anciennes données et commencer avec une ardoise propre ?",
      cleanupButton: "Effacer les données",
      keepButton: "Conserver les données",
      cleaningUp: "Nettoyage en cours...",
      warning: "Cette action est irréversible",
    },
    en: {
      title: "Previous data detected",
      description:
        "DoseMate has detected encrypted data from a previous installation. This data may contain sensitive information (insulin table, history, settings).",
      question: "Do you want to delete this old data and start with a clean slate?",
      cleanupButton: "Delete data",
      keepButton: "Keep data",
      cleaningUp: "Cleaning up...",
      warning: "This action is irreversible",
    },
  };

  const t = content[language];

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-left">
            <p>{t.description}</p>
            <p className="font-medium text-foreground">{t.question}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {t.warning}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={onKeep}
            disabled={isCleaningUp}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            {t.keepButton}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onCleanup}
            disabled={isCleaningUp}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isCleaningUp ? t.cleaningUp : t.cleanupButton}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
