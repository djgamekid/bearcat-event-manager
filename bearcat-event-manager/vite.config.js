import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
  },
  server: {
    port: 5173,
    host: true,
  },
  proxy: {
    "/api": {
      target: "https://firestore.googleapis.com",
      changeOrigin: true,
      secure: false,
    },
  },
})
