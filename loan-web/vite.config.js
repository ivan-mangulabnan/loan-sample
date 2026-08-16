import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The API has no CORS policy, so same-origin proxy it in dev.
    // Uses plain HTTP to avoid the dev certificate.
    proxy: {
      '/api': {
        target: 'http://localhost:5132',
        changeOrigin: true,
      },
    },
  },
})
