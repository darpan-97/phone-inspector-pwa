import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    base: '/phone-inspector-pwa/',
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['pwa-192.png', 'pwa-512.png'],
            manifest: {
                name: 'Phone Inspector',
                short_name: 'PhoneInspect',
                description: 'Advanced phone number analysis and validation tool',
                theme_color: '#0b0f14',
                background_color: '#0b0f14',
                display: 'standalone',
                icons: [
                    {
                        src: 'pwa-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ]
})
