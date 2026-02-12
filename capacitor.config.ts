import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'chat-ionic',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  "server": {
    "cleartext": true,
    "allowNavigation": ["10.0.2.2", "localhost"]
  }
};

export default config;

