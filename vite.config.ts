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
      // यह जोड़ें: ताकि अपडेट होने पर पुराना कैश हट जाए
      selfDestroying: true, 
      includeAssets: ['icon.png'], 
      workbox: {
        maximumFileSizeToCacheInBytes: 3000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // यह जोड़ें: नई फाइलें हमेशा नेटवर्क से लोड हों
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
        enabled: false // डेवलपमेंट में PWA ऑफ रहेगा
      },
      manifest: {
          "name": "KidsTube",
          "short_name": "KidsTube",
          "start_url": "/",
          "display": "standalone",
          "background_color": "#0f172a",
          "theme_color": "#1e3a8a",
          "orientation": "landscape",
          icons: [
                  {
                    src: '/icon.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any' // <-- यहाँ सिर्फ 'any' करें
                  },
                  {
                    src: '/icon.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any' // <-- यहाँ भी सिर्फ 'any' करें
                  },
                  // (वैकल्पिक) Android के लिए एक अलग मास्केबल आइकन
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
