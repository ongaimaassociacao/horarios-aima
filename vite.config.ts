import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Agenda AIMA',
        short_name: 'AIMA',
        description: 'Agenda da Instituição AIMA',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'https://i.ibb.co/kVxhMRtT/LOGO.jpg',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://i.ibb.co/kVxhMRtT/LOGO.jpg',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})