import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExitConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ExitConfirmDialog({ open, onConfirm, onCancel }: ExitConfirmDialogProps) {
  const { language } = useLanguage();

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base">
            <LogOut className="h-5 w-5 text-primary" />
            {language === 'fr' ? 'Quitter DoseMate ?' : 'Exit DoseMate?'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            {language === 'fr' 
              ? 'Êtes-vous sûr de vouloir quitter l\'application ?'
              : 'Are you sure you want to exit the application?'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2 sm:justify-end">
          <AlertDialogCancel onClick={onCancel} className="flex-1 sm:flex-initial">
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="flex-1 sm:flex-initial bg-destructive hover:bg-destructive/90">
            {language === 'fr' ? 'Quitter' : 'Exit'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
