import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // So requests to "/api" are forwarded to Flask
      '/api': 'http://127.0.0.1:5000',
    }
  }
})