import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.glucoflow.app',
  appName: 'GlucoFlow',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    permissions: [
      'INTERNET',
      'ACCESS_NETWORK_STATE'
    ]
  }
};

export default config;
