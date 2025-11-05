import type { LibreLinkUpConfig, GlucoseReading } from "../types/insulin";
import { LibreLinkUpClient } from '@diakem/libre-link-up-api-client';

/* ============================
   LibreLinkUp Service (Real Integration)
   ============================ */

export class LibreLinkUpService {
  private config: LibreLinkUpConfig | null = null;
  private lastReading: GlucoseReading | null = null;

  async connect(username: string, password: string, region: string = 'EU'): Promise<boolean> {
    try {
      // Méthode DRFROST : définir config avant validation
      this.config = { username, password, region };
      
      const { read } = LibreLinkUpClient({
        username,
        password
      });

      // Validation des identifiants par appel API réel
      await read();

      return true;
    } catch (error) {
      console.error('Échec de connexion LibreLinkUp:', error);
      this.config = null; // réinitialiser config si erreur
      return false;
    }
  }

  async fetchLatestGlucose(): Promise<GlucoseReading | null> {
    if (!this.config) return null;

    try {
      const { read } = LibreLinkUpClient({
        username: this.config.username,
        password: this.config.password
      });

      const response = await read();

      if (response && response.current) {
        const reading: GlucoseReading = {
          value: response.current.value,
          timestamp: response.current.date,
          trend: response.current.trend || 'stable',
          source: 'librelinkup'
        };
        this.lastReading = reading;
        return reading;
      }
      return null;

    } catch (error: any) {
      console.error('Erreur attrapée dans fetchLatestGlucose:', error);
      throw new Error(error?.message || 'Erreur inconnue LibreLinkUp');
    }
  }

  getLastReading(): GlucoseReading | null {
    return this.lastReading;
  }

  disconnect() {
    this.config = null;
    this.lastReading = null;
  }

  isConnected(): boolean {
    return this.config !== null;
  }
}
