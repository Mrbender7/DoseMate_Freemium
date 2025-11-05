import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Wifi, WifiOff, RefreshCw, Eye, EyeOff } from "lucide-react";
import type { GlucoseReading } from "../../types/insulin";
import { useState } from "react";

interface NightscoutPanelProps {
  nsConnected: boolean;
  nsUrl: string;
  nsApiSecret: string;
  currentGlucose: GlucoseReading | null;
  autoSync: boolean;
  syncInterval: number;
  lastSync: Date | null;
  onUrlChange: (value: string) => void;
  onApiSecretChange: (value: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onManualSync: () => void;
  onAutoSyncChange: (value: boolean) => void;
  onSyncIntervalChange: (value: number) => void;
  onClose: () => void;
}

export function NightscoutPanel({
  nsConnected,
  nsUrl,
  nsApiSecret,
  currentGlucose,
  autoSync,
  syncInterval,
  lastSync,
  onUrlChange,
  onApiSecretChange,
  onConnect,
  onDisconnect,
  onManualSync,
  onAutoSyncChange,
  onSyncIntervalChange,
  onClose,
}: NightscoutPanelProps) {
  const [showApiSecret, setShowApiSecret] = useState(false);

  return (
    <Card className="shadow-lg border-2 border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {nsConnected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5" />}
          Configuration Nightscout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!nsConnected ? (
          <>
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
              <AlertDescription className="text-sm">
                🌙 <strong>Connectez votre instance Nightscout.</strong> Entrez l'URL de votre site Nightscout 
                et votre API Secret si vous en avez configuré un.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">URL Nightscout</label>
                <Input
                  type="url"
                  value={nsUrl}
                  onChange={(e) => onUrlChange(e.target.value)}
                  placeholder="https://votre-site.herokuapp.com"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  API Secret <span className="text-xs text-muted-foreground/60">(optionnel)</span>
                </label>
                <div className="relative mt-1">
                  <Input
                    type={showApiSecret ? "text" : "password"}
                    value={nsApiSecret}
                    onChange={(e) => onApiSecretChange(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiSecret(!showApiSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showApiSecret ? "Masquer l'API Secret" : "Afficher l'API Secret"}
                  >
                    {showApiSecret ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={onConnect} className="flex-1">
                <Wifi className="h-4 w-4 mr-2" />
                Se connecter
              </Button>
              <Button onClick={onClose} variant="outline">
                Annuler
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-900">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">✅ Connexion active</p>
                  <p className="text-sm text-green-600 dark:text-green-400 break-all">
                    {nsUrl}
                  </p>
                </div>
                {lastSync && (
                  <Badge variant="outline" className="text-xs">
                    {lastSync.toLocaleTimeString()}
                  </Badge>
                )}
              </div>

              {currentGlucose && (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground mb-1">Dernière glycémie</p>
                  <p className="text-2xl font-bold font-mono">
                    {Math.round(currentGlucose.value)} mg/dL
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentGlucose.timestamp.toLocaleString()} • {currentGlucose.trend}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Synchronisation automatique</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => onAutoSyncChange(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Activée</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Intervalle (minutes)</label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={syncInterval}
                  onChange={(e) => onSyncIntervalChange(Number(e.target.value) || 5)}
                  className="mt-1"
                  disabled={!autoSync}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={onManualSync} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Synchroniser maintenant
              </Button>
              <Button onClick={onDisconnect} variant="outline">
                <WifiOff className="h-4 w-4 mr-2" />
                Déconnecter
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
