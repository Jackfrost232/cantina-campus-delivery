/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' deixa os caminhos relativos: o build funciona na raiz (Vercel, Netlify)
// e em subpasta (GitHub Pages) sem configurar o nome do repositório.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    include: ['src/testes/**/*.test.ts'],
  },
})
