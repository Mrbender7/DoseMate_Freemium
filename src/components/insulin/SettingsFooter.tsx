import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Trash2, Mail } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export function SettingsFooter() {
  const { t } = useLanguage();
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleResetAll = () => {
    // Clear all localStorage and force unlock state on next launch
    localStorage.clear();
    localStorage.setItem("dosemate_table_locked", JSON.stringify(false));
    // Reload the app to trigger onboarding
    window.location.reload();
  };

  return (
    <>
      <Card className="bg-muted/20 border-dashed">
        <CardContent className="py-3 px-3 space-y-2">
          <Button
            onClick={() => setShowResetDialog(true)}
            variant="destructive"
            size="sm"
            className="w-full gap-2 h-9"
          >
            <Trash2 className="h-4 w-4" />
            {t.settings.resetAllData}
          </Button>

          <a
            href="mailto:peak.beryl8090@eagereverest.com"
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            <Mail className="h-3.5 w-3.5" />
            {t.settings.contactSupport}
          </a>

          <p className="text-[10px] text-muted-foreground/60 text-center">
            {t.settings.version} 1.0.0
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">
              {t.settings.resetConfirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed pt-2">
              {t.settings.resetConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">
              {t.settings.resetCancelButton}
            </AlertDialogCancel>
            <AlertDialogAction 
              className="text-xs bg-destructive hover:bg-destructive/90"
              onClick={handleResetAll}
            >
              {t.settings.resetConfirmButton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
