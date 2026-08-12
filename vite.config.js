import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),   // Tailwind v4: handled as a Vite plugin, not PostCSS
    react(),
  ],
})
