import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
// Se importa `defineConfig` de 'vitest/config' (y no de 'vite') para que
// TypeScript reconozca la clave `test`, que es de Vitest y no de Vite.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  /*
   * El puerto del `preview` se fija, y `strictPort` impide que Vite salte al
   * siguiente si está ocupado (Fase 8).
   *
   * Los tests de Playwright se ejecutan contra `npm run build && npm run
   * preview` en esta dirección exacta. Sin `strictPort`, un 4173 ocupado haría
   * que Vite sirviera en el 4174 y los tests pasarían —o fallarían— contra lo
   * que hubiera en el 4173, que no es lo que se acaba de compilar. Con él, el
   * servidor no arranca y el error se lee enseguida.
   */
  preview: {
    port: 4173,
    strictPort: true,
  },
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
