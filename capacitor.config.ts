import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4d26950436a4432a92c9f592806d27b3',
  appName: 'dosmatefreemium',
  webDir: 'dist',
  server: {
    url: 'https://4d269504-36a4-432a-92c9-f592806d27b3.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      showSpinner: false,
      backgroundColor: "#111827"
    },
    App: {
      // Configuration du plugin App pour le bouton retour
    }
  }
};

export default config;
