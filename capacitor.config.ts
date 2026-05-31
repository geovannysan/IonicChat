import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.healpchat.app',
  appName: 'healpchat',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    PushNotifications:{
      presentationOptions:["badge","sound","alert"]
    }
  },
  "server": {
    "cleartext": true,
     "allowNavigation": ["10.0.2.2", "localhost", "192.168.0.105"]

  }
};

export default config;

