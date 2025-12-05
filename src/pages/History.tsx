import { useDoseHistory } from '@/hooks/use-dose-history';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { 
  History as HistoryIcon, 
  Droplet, 
  Utensils, 
  Trash2, 
  AlertCircle,
  Clock,
  Syringe,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function History() {
  const { t, language } = useLanguage();
  const { history, isLoading, error, isAuthenticated, removeDose } = useDoseHistory();

  const locale = language === 'fr' ? fr : enUS;

  const formatDate = (dateISO: string) => {
    try {
      const date = new Date(dateISO);
      return {
        time: format(date, 'HH:mm', { locale }),
        date: format(date, 'dd MMM yyyy', { locale }),
        relative: getRelativeTime(date)
      };
    } catch {
      return { time: '', date: dateISO, relative: '' };
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return language === 'fr' ? "À l'instant" : 'Just now';
    if (diffHours < 24) return language === 'fr' ? `Il y a ${diffHours}h` : `${diffHours}h ago`;
    if (diffDays === 1) return language === 'fr' ? 'Hier' : 'Yesterday';
    if (diffDays < 7) return language === 'fr' ? `Il y a ${diffDays} jours` : `${diffDays} days ago`;
    return '';
  };

  const getMomentConfig = (moment: string) => {
    const configs: Record<string, { label: string; emoji: string; bgClass: string }> = {
      morning: { 
        label: language === 'fr' ? 'Matin' : 'Morning', 
        emoji: '☀️',
        bgClass: 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
      },
      noon: { 
        label: language === 'fr' ? 'Midi' : 'Noon', 
        emoji: '🌤️',
        bgClass: 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
      },
      evening: { 
        label: language === 'fr' ? 'Soir' : 'Evening', 
        emoji: '🌙',
        bgClass: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
      },
      extra: { 
        label: language === 'fr' ? 'Extra' : 'Extra', 
        emoji: '➕',
        bgClass: 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
      }
    };
    return configs[moment] || configs.extra;
  };

  // Calcul des statistiques
  const stats = history.length > 0 ? {
    avgDose: Math.round(history.reduce((sum, h) => sum + h.totalAdministered, 0) / history.length * 10) / 10,
    avgGlycemia: Math.round(
      history.filter(h => h.glycemia).reduce((sum, h) => sum + (h.glycemia || 0), 0) / 
      history.filter(h => h.glycemia).length * 10
    ) / 10 || null,
    total: history.length
  } : null;

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
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
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
      {/* En-tête avec statistiques */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-primary/10">
              <HistoryIcon className="h-5 w-5 text-primary" />
            </div>
            {language === 'fr' ? 'Historique des doses' : 'Dose History'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-card/50 border border-border/30">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-xs text-muted-foreground">
                  {language === 'fr' ? 'Entrées' : 'Entries'}
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-card/50 border border-border/30">
                <div className="text-2xl font-bold text-primary">{stats.avgDose}U</div>
                <div className="text-xs text-muted-foreground">
                  {language === 'fr' ? 'Moy. dose' : 'Avg dose'}
                </div>
              </div>
              {stats.avgGlycemia && (
                <div className="text-center p-3 rounded-lg bg-card/50 border border-border/30">
                  <div className="text-2xl font-bold text-primary">{stats.avgGlycemia}</div>
                  <div className="text-xs text-muted-foreground">
                    {language === 'fr' ? 'Moy. glyc.' : 'Avg BG'}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des doses */}
      <Card className="border-primary/20">
        <CardContent className="p-3">
          {history.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Syringe className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {language === 'fr' ? 'Aucune dose enregistrée' : 'No doses recorded'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {language === 'fr' 
                  ? "Vos doses d'insuline apparaîtront ici une fois enregistrées depuis l'onglet principal."
                  : 'Your insulin doses will appear here once saved from the main tab.'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[55vh]">
              <div className="space-y-3 pr-2">
                {history.map((entry, index) => {
                  const { time, date, relative } = formatDate(entry.dateISO);
                  const momentConfig = getMomentConfig(entry.moment);
                  
                  return (
                    <Card 
                      key={entry.id} 
                      className={cn(
                        "group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300",
                        "bg-gradient-to-br from-card to-card/80",
                        "animate-fade-in"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CardContent className="p-4">
                        {/* En-tête : Date/Heure et Moment */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{time}</span>
                            <span className="text-xs text-muted-foreground/60">•</span>
                            <span className="text-xs text-muted-foreground">{date}</span>
                            {relative && (
                              <>
                                <span className="text-xs text-muted-foreground/60">•</span>
                                <span className="text-xs text-muted-foreground/80">{relative}</span>
                              </>
                            )}
                          </div>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            momentConfig.bgClass
                          )}>
                            {momentConfig.emoji} {momentConfig.label}
                          </span>
                        </div>

                        {/* Dose principale - Grande et en évidence */}
                        <div className="flex items-baseline gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <Syringe className="h-5 w-5 text-primary" />
                            <span className="text-3xl font-bold text-primary">
                              {entry.totalAdministered}
                            </span>
                            <span className="text-lg text-primary/70">U</span>
                          </div>
                          {entry.totalCalculated !== entry.totalAdministered && (
                            <span className="text-sm text-muted-foreground">
                              ({language === 'fr' ? 'calculé' : 'calc'}: {entry.totalCalculated}U)
                            </span>
                          )}
                        </div>

                        {/* Détails : Glycémie et Repas */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          {entry.glycemia !== undefined && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10">
                              <Droplet className="h-4 w-4 text-blue-500" />
                              <div>
                                <span className="font-medium text-foreground">{entry.glycemia}</span>
                                <span className="text-muted-foreground ml-1">mg/dL</span>
                                {entry.base !== null && entry.base !== undefined && (
                                  <span className="text-blue-500 ml-2">→ {entry.base}U</span>
                                )}
                              </div>
                            </div>
                          )}
                          {entry.meal !== null && entry.meal !== undefined && entry.meal > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10">
                              <Utensils className="h-4 w-4 text-orange-500" />
                              <div>
                                <span className="font-medium text-foreground">{entry.meal}</span>
                                <span className="text-muted-foreground ml-1">U</span>
                                <span className="text-orange-500 ml-1">
                                  {language === 'fr' ? 'repas' : 'meal'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Bouton supprimer - Discret */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "absolute top-2 right-2 h-8 w-8",
                            "text-muted-foreground/50 hover:text-destructive",
                            "opacity-0 group-hover:opacity-100 transition-opacity"
                          )}
                          onClick={() => removeDose(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
