import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 80,
    host: '0.0.0.0',
    watch: {
      usePolling: true,
    },
    hmr: {
      host: 'signbank.upf.com',
      protocol: 'ws',
      clientPort: 80
    }
  }
})
