import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
// Se importa `defineConfig` de 'vitest/config' (y no de 'vite') para que
// TypeScript reconozca la clave `test`, que es de Vitest y no de Vite.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // jsdom simula un navegador en Node, para poder renderizar componentes.
    environment: 'jsdom',
    // Se ejecuta antes de cada archivo de test: matchers y limpieza del DOM.
    setupFiles: ['./src/test/setup.ts'],
    // Solo los tests unitarios y de integración. Los E2E de Playwright
    // vivirán en e2e/ (Fase 8) y los ejecuta su propio runner.
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
    },
  },
})
