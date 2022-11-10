import { execSync } from 'child_process'
import { defineConfig } from 'vite'
import { run } from 'vite-plugin-run'
import vue from '@vitejs/plugin-vue'
import replace from '@rollup/plugin-replace'
import { VitePWA } from 'vite-plugin-pwa'

const plugins = [
  replace({
    __COMMIT__: execSync('git rev-parse HEAD').toString().trim(),
    __BUILD_DATE__: new Date().toLocaleString()
  }),
  VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: [
        '**/*.{js,css,html}',
        'apple-touch-icon.png',
        'crypto.wasm'
      ]
    },
    manifest: {
      name: 'My OVPN',
      short_name: 'My OVPN',
      icons: [
        {
          src: 'LibreService.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        }
      ]
    }
  }),
  vue()
]

if (process.env.NODE_ENV !== 'production') {
  plugins.push(run([
    {
      name: 'Transpile worker',
      run: ['pnpm run worker'],
      condition: file => file.includes('worker.ts')
    }
  ]))
}

export default defineConfig({
  plugins
})
