import { defineConfig, devices } from '@playwright/test'

/* =============================================================================
 * CONFIGURACIÓN DE PLAYWRIGHT — TESTS DE PUNTA A PUNTA (FASE 8)
 * =============================================================================
 *
 * Los tests E2E viven en `e2e/` y los ejecuta Playwright. Los 560 tests
 * unitarios y de integración viven en `src/` y los ejecuta Vitest. La
 * separación es doble y deliberada:
 *
 * | Runner     | Carpeta | Patrón de archivo |
 * | ---------- | ------- | ----------------- |
 * | Vitest     | `src/`  | `*.test.ts(x)`    |
 * | Playwright | `e2e/`  | `*.spec.ts`       |
 *
 * Ni las carpetas ni los patrones coinciden, así que ninguno de los dos puede
 * recoger los tests del otro aunque se cambie una de las dos cosas.
 * ========================================================================== */

/**
 * Puerto del `vite preview`.
 *
 * Está fijado **también** en `vite.config.ts`, con `strictPort: true`. Sin esa
 * pareja, Vite salta al puerto siguiente cuando el 4173 está ocupado y los
 * tests apuntarían a una página que no es la que acaban de compilar. Con
 * `strictPort`, el servidor falla al arrancar y el fallo es inmediato y legible.
 */
const PUERTO_PREVIEW = 4173
const BASE_URL = `http://localhost:${String(PUERTO_PREVIEW)}`

export default defineConfig({
  testDir: './e2e',

  // Cada archivo de test se ejecuta en paralelo con los demás. Cada test
  // recibe un contexto de navegador limpio, así que el `localStorage` de uno
  // no puede ver el del otro: el contador de presupuestos empieza en 0001 en
  // todos, y eso hace predecible el número del documento.
  fullyParallel: true,

  /*
   * **Sin reintentos.** Un test que pasa al segundo intento no está probado,
   * está disculpado. Si alguno resulta inestable, se arregla la espera.
   */
  retries: 0,

  // Impide que un `test.only` olvidado deje al resto sin ejecutar en CI
  // (GitHub Actions llega en la Fase 9).
  forbidOnly: process.env.CI !== undefined,

  reporter: [
    // En la terminal, para verlo al lanzarlo a mano.
    ['list'],
    // El informe navegable, que se abre con `npm run test:e2e:report`. No se
    // abre solo al terminar: interrumpe cuando los tests pasan, que es casi
    // siempre. La carpeta está en el .gitignore desde la Fase 1.
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL: BASE_URL,

    /*
     * El idioma y la zona horaria se fijan a propósito, por la misma razón por
     * la que ningún test depende del día en que se ejecute: el documento
     * imprime fechas, y la fecha que ve el navegador depende de su zona
     * horaria. Fijándola aquí, estos tests dan el mismo resultado en este
     * equipo y en el servidor de GitHub Actions de la Fase 9.
     *
     * Canarias, porque el impuesto del presupuesto es el IGIC.
     */
    locale: 'es-ES',
    timezoneId: 'Atlantic/Canary',

    /*
     * Material de diagnóstico **solo cuando algo falla**. Las tres carpetas que
     * lo reciben (`test-results`, `playwright-report`, `blob-report`) están en
     * el .gitignore desde la Fase 1, así que nunca se versiona.
     */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  // Solo Chromium: es lo que se ha instalado (riesgo R7) y lo que basta para
  // probar los recorridos de esta aplicación.
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    /*
     * **Contra el build local, nunca contra la web publicada.** Se compila y se
     * sirve el resultado, que es exactamente lo que se despliega.
     */
    command: 'npm run build && npm run preview',
    url: BASE_URL,

    /*
     * `false` a propósito, y es una decisión del usuario: con `true`, un
     * `preview` que se hubiera quedado abierto de hace un rato se reutilizaría
     * y los tests pasarían sobre un build antiguo sin que nada lo dijera. Así
     * cada ejecución compila. Si el puerto está ocupado, `strictPort` hace que
     * falle con un mensaje claro en lugar de mentir.
     */
    reuseExistingServer: false,

    // `tsc -b && vite build` tarda unos segundos; el margen es para la primera
    // vez, cuando TypeScript no tiene nada en caché.
    timeout: 180_000,
  },
})
