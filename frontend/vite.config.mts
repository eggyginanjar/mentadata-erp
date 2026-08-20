import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Mentadata ERP & POS',
        short_name: 'Mentadata',
        description: 'Aplikasi manajemen UMKM dan POS Kasir Pintar',
        theme_color: '#004D40', /* Warna Teal Darken 3 kita */
        background_color: '#ffffff',
        display: 'standalone', /* Membuatnya tampil penuh layar tanpa URL bar (layaknya aplikasi asli) */
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})