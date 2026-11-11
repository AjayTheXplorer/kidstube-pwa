import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png'], 
      workbox: {
        maximumFileSizeToCacheInBytes: 3000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false
      },
      manifest: {
        id: "/", 
        name: "KidsTube",
        short_name: "KidsTube",
        start_url: "/",
        display: "standalone",
        background_color: "#0f172a",
        theme_color: "#1e3a8a",
        orientation: "portrait", // यह पोर्ट्रेट है
        icons: [
          {
            src: '/icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon.png', 
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable' 
          }
        ]
      }
    })
  ],
})