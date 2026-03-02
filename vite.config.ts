import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/primevue/config')) {
            return 'primevue-core'
          }
          const primeVueMatch = id.match(/node_modules\/primevue\/([^/]+)/)
          if (primeVueMatch?.[1]) {
            return `primevue-${primeVueMatch[1]}`
          }
          if (id.includes('node_modules/@primevue') || id.includes('node_modules/@primeuix')) {
            return 'primevue-core'
          }
          if (id.includes('node_modules/primeicons')) {
            return 'primeicons'
          }
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router') || id.includes('node_modules/pinia')) {
            return 'vue-core'
          }
          if (id.includes('node_modules/@tanstack')) {
            return 'tanstack'
          }
          return undefined
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
