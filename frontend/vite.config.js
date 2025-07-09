import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:5000'
    },
    allowedHosts: [
      '775e-2001-ee0-4101-8aaa-1dc6-da61-1aed-597.ngrok-free.app'
    ]
  }
})
