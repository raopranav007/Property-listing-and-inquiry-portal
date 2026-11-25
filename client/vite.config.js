import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const API = process.env.VITE_API_PROXY || 'http://localhost:5000'

// During development, API requests are forwarded to the Express server.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': API,
    },
  },
})
