import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O app é publicado em https://<usuario>.github.io/verify-it/
export default defineConfig({
  base: '/verify-it/',
  plugins: [react()],
})
