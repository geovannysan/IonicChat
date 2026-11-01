/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },

  build: {
    // 'inline' embebe el source map dentro de cada bundle JS.
    // Es necesario para que translateStackTrace.ts pueda leerlo desde
    // http://localhost/assets/index-xxx.js en el WebView de Android/Capacitor.
    // Los mapas externos (.js.map) NO son accesibles desde el WebView porque
    // Capacitor no los sirve por defecto, pero el inline sí está disponible.
    sourcemap: 'inline',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/maplibre-gl/')) {
            return 'maplibre'
          }
          if (id.includes('node_modules/')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
