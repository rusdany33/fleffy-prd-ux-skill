import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base relatif agar bisa di-deploy di GitHub Pages (subpath /<repo>/)
export default defineConfig({
  base: './',
  plugins: [react()],
})
