import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Agendaweb/', // 👈 nombre exacto de tu repo en GitHub
  server: {
    port: 3000,
    open: true
  }
})

