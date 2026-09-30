import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // @ajaia/schema ships CJS (server needs CJS); pre-bundle it for the browser.
    include: ['@ajaia/schema'],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:1829',
    },
  },
})