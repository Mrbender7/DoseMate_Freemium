import type { GlucoseReading } from "../types/insulin";

/* ============================
   Nightscout Service
   ============================ */

export class NightscoutService {
  private url: string | null = null;
  private apiSecret: string | null = null;
  private lastReading: GlucoseReading | null = null;

  async connect(url: string, apiSecret?: string): Promise<boolean> {
    try {
      // Nettoyer l'URL (retirer le / final si présent)
      const cleanUrl = url.replace(/\/$/, '');
      
      // Test de connexion
      const headers: HeadersInit = {};
      if (apiSecret) {
        headers['API-SECRET'] = apiSecret;
      }

      const response = await fetch(`${cleanUrl}/api/v1/entries.json?count=1`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Connexion réussie
      this.url = cleanUrl;
      this.apiSecret = apiSecret || null;
      return true;
    } catch (error) {
      console.error('Échec de connexion Nightscout:', error);
      this.url = null;
      this.apiSecret = null;
      return false;
    }
  }

  async fetchLatestGlucose(): Promise<GlucoseReading | null> {
    if (!this.url) return null;

    try {
      const headers: HeadersInit = {};
      if (this.apiSecret) {
        headers['API-SECRET'] = this.apiSecret;
      }

      const response = await fetch(`${this.url}/api/v1/entries.json?count=1`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const entry = data[0];
        const reading: GlucoseReading = {
          value: entry.sgv,
          timestamp: new Date(entry.dateString || entry.date),
          trend: this.mapTrend(entry.direction),
          source: 'nightscout'
        };
        this.lastReading = reading;
        return reading;
      }
      return null;

    } catch (error: any) {
      console.error('Erreur Nightscout fetchLatestGlucose:', error);
      throw new Error(error?.message || 'Erreur inconnue Nightscout');
    }
  }

  private mapTrend(direction?: string): string {
    if (!direction) return 'stable';
    
    const trendMap: Record<string, string> = {
      'DoubleUp': 'rising_fast',
      'SingleUp': 'rising',
      'FortyFiveUp': 'rising',
      'Flat': 'stable',
      'FortyFiveDown': 'falling',
      'SingleDown': 'falling',
      'DoubleDown': 'falling_fast',
      'NONE': 'stable',
      'NOT COMPUTABLE': 'stable'
    };
    
    return trendMap[direction] || 'stable';
  }

  getLastReading(): GlucoseReading | null {
    return this.lastReading;
  }

  disconnect() {
    this.url = null;
    this.apiSecret = null;
    this.lastReading = null;
  }

  isConnected(): boolean {
    return this.url !== null;
  }
}
