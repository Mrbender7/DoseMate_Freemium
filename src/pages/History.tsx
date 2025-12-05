import { useDoseHistory } from '@/hooks/use-dose-history';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { History as HistoryIcon, Droplet, Utensils, Trash2, AlertCircle } from 'lucide-react';

export default function History() {
  const { t, language } = useLanguage();
  const { history, isLoading, error, isAuthenticated, removeDose } = useDoseHistory();

  const locale = language === 'fr' ? fr : enUS;

  const formatDate = (dateISO: string) => {
    try {
      return format(new Date(dateISO), 'PPp', { locale });
    } catch {
      return dateISO;
    }
  };

  const getMomentLabel = (moment: string) => {
    const labels: Record<string, string> = {
      morning: language === 'fr' ? 'Matin' : 'Morning',
      noon: language === 'fr' ? 'Midi' : 'Noon',
      evening: language === 'fr' ? 'Soir' : 'Evening',
      extra: language === 'fr' ? 'Extra' : 'Extra'
    };
    return labels[moment] || moment;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              {language === 'fr' ? 'Historique des doses' : 'Dose History'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{language === 'fr' ? 'Erreur de chargement' : 'Loading error'}: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-muted">
          <CardContent className="p-6 text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{language === 'fr' ? 'Authentification requise' : 'Authentication required'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HistoryIcon className="h-5 w-5 text-primary" />
            {language === 'fr' ? 'Historique des doses' : 'Dose History'}
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {history.length} {language === 'fr' ? 'entrées' : 'entries'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <HistoryIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>{language === 'fr' ? 'Aucun historique' : 'No history yet'}</p>
              <p className="text-sm mt-1">
                {language === 'fr' 
                  ? 'Vos doses enregistrées apparaîtront ici'
                  : 'Your saved doses will appear here'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-3 pr-4">
                {history.map((entry) => (
                  <Card key={entry.id} className="bg-card/50 border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          {/* Date et moment */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatDate(entry.dateISO)}</span>
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                              {getMomentLabel(entry.moment)}
                            </span>
                          </div>

                          {/* Résultat principal */}
                          <div className="text-xl font-bold text-primary">
                            {entry.totalAdministered}U
                            {entry.totalCalculated !== entry.totalAdministered && (
                              <span className="text-sm font-normal text-muted-foreground ml-2">
                                ({language === 'fr' ? 'calculé' : 'calculated'}: {entry.totalCalculated}U)
                              </span>
                            )}
                          </div>

                          {/* Détails */}
                          <div className="flex flex-wrap gap-3 text-sm">
                            {entry.glycemia !== undefined && (
                              <div className="flex items-center gap-1">
                                <Droplet className="h-4 w-4 text-blue-400" />
                                <span>{entry.glycemia} mg/dL</span>
                                {entry.base !== null && entry.base !== undefined && (
                                  <span className="text-muted-foreground">→ {entry.base}U</span>
                                )}
                              </div>
                            )}
                            {entry.meal !== null && entry.meal !== undefined && entry.meal > 0 && (
                              <div className="flex items-center gap-1">
                                <Utensils className="h-4 w-4 text-orange-400" />
                                <span>{entry.meal}U {language === 'fr' ? 'repas' : 'meal'}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bouton supprimer */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeDose(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
