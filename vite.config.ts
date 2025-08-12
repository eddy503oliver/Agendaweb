import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Agendaweb/', // 👈 Nombre exacto del repositorio
  server: {
    port: 3000,
    open: true
  }
})
