import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Shepherd OS',
        short_name: 'Shepherd OS',
        description: 'Church Leadership & Management Operating System — Pinamalayan, Oriental Mindoro',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        // Fills the space behind the OS status bar / around the app on
        // Android, and the safe-area color on iOS while the app boots.
        background_color: '#f7f5ef',
        // Android task-switcher header color, iOS status bar tint.
        theme_color: '#2f5233',
        orientation: 'portrait-primary',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Without these two, Workbox's default behavior is to install the
        // new service worker but leave it "waiting" until every open tab/
        // instance of the app is fully closed — which can take a long time
        // for an installed PWA that's rarely closed, making deploys feel
        // like they "didn't take effect." These two make a new deploy's
        // service worker activate and take over immediately on next load.
        skipWaiting: true,
        clientsClaim: true,
        // Cache the app shell + the OSM map tiles so the map still shows
        // previously-viewed areas when offline/on a flaky connection —
        // useful for outreach workers in the field with spotty signal.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
