import { readFileSync } from 'node:fs'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/* =============================================================================
 * LAS CABECERAS DE PRODUCCIÓN, EN EL SERVIDOR DE `preview` (FASE 10)
 * =============================================================================
 *
 * La `Content-Security-Policy` y las otras cuatro cabeceras de seguridad las
 * sirve **Vercel**, a partir de `vercel.json`. El problema es que los cinco
 * recorridos de Playwright no se ejecutan contra Vercel: se ejecutan contra
 * `vite preview`, que no sabe nada de ese archivo. Sin esto, un
 * `npm run test:e2e` en verde **no diría absolutamente nada de la CSP**, que es
 * precisamente la cabecera que puede dejar la aplicación en blanco si está mal
 * escrita.
 *
 * Así que el `preview` lee `vercel.json` y sirve lo que diga. La CSP tiene
 * **una sola fuente** y los recorridos prueban la cabecera literal que va a
 * producción, no una copia escrita a mano al lado que puede separarse de ella.
 *
 * Dos decisiones que conviene dejar dichas:
 *
 * - **Solo en `preview`, nunca en `dev`.** El servidor de desarrollo necesita
 *   código en línea y `eval` para el recambio en caliente, así que una CSP
 *   estricta lo rompería. Y no es una pérdida: lo que se despliega es el build,
 *   que es lo que sirve el `preview`.
 * - **Si la regla no aparece, esto lanza un error en lugar de seguir.** Un
 *   `return {}` silencioso dejaría el `preview` sin cabeceras y los recorridos
 *   pasarían sin comprobar nada: una comprobación que no puede dar un resultado
 *   negativo no es una comprobación (apartado 5 de `CLAUDE.md`).
 * ========================================================================== */

/** La regla de `vercel.json` que se aplica a todas las rutas. */
const RUTA_DE_TODAS_LAS_PETICIONES = '/(.*)'

interface ConfiguracionDeVercel {
  headers: {
    source: string
    headers: { key: string; value: string }[]
  }[]
}

function cabecerasDeProduccion(): Record<string, string> {
  const vercel = JSON.parse(
    readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'),
  ) as ConfiguracionDeVercel

  const regla = vercel.headers.find(
    (entrada) => entrada.source === RUTA_DE_TODAS_LAS_PETICIONES,
  )

  if (regla === undefined) {
    throw new Error(
      `vercel.json no tiene ninguna regla de cabeceras para "${RUTA_DE_TODAS_LAS_PETICIONES}". ` +
        'El `preview` serviría sin cabeceras de seguridad y los tests E2E dejarían de comprobar la CSP.',
    )
  }

  return Object.fromEntries(
    regla.headers.map((cabecera) => [cabecera.key, cabecera.value]),
  )
}

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
    // Las cinco cabeceras de `vercel.json`, incluida la CSP (ver arriba).
    headers: cabecerasDeProduccion(),
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
