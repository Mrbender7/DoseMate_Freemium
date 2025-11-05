import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import type { GlucoseReading } from "../../types/insulin";

interface LibreLinkUpPanelProps {
  llupConnected: boolean;
  llupUsername: string;
  llupPassword: string;
  llupRegion: string;
  currentGlucose: GlucoseReading | null;
  autoSync: boolean;
  syncInterval: number;
  lastSync: Date | null;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onManualSync: () => void;
  onAutoSyncChange: (value: boolean) => void;
  onSyncIntervalChange: (value: number) => void;
  onClose: () => void;
}

export function LibreLinkUpPanel({
  llupConnected,
  llupUsername,
  llupPassword,
  llupRegion,
  currentGlucose,
  autoSync,
  syncInterval,
  lastSync,
  onUsernameChange,
  onPasswordChange,
  onRegionChange,
  onConnect,
  onDisconnect,
  onManualSync,
  onAutoSyncChange,
  onSyncIntervalChange,
  onClose,
}: LibreLinkUpPanelProps) {
  return (
    <Card className="shadow-lg border-2 border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {llupConnected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5" />}
          Configuration LibreLinkUp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!llupConnected ? (
          <>
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
              <AlertDescription className="text-sm">
                🔒 <strong>Connexion sécurisée cloud Abbott.</strong> Aucun accès direct au capteur. 
                Vos identifiants LibreView permettent de récupérer vos glycémies automatiquement.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email LibreView</label>
                <Input
                  type="email"
                  value={llupUsername}
                  onChange={(e) => onUsernameChange(e.target.value)}
                  placeholder="votre@email.com"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Mot de passe</label>
                <Input
                  type="password"
                  value={llupPassword}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Région</label>
                <select
                  value={llupRegion}
                  onChange={(e) => onRegionChange(e.target.value)}
                  className="w-full mt-1 p-2 rounded-md border border-input bg-background"
                >
                  <option value="EU">Europe (EU)</option>
                  <option value="US">États-Unis (US)</option>
                  <option value="AP">Asie-Pacifique (AP)</option>
                </select>
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
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {llupUsername} • Région {llupRegion}
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
