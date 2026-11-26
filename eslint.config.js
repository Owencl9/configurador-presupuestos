import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier/flat'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  // Material generado: compilado, cobertura e informes de Playwright (Fase 8).
  globalIgnores([
    'dist',
    'coverage',
    'playwright-report',
    'test-results',
    'blob-report',
  ]),

  // La aplicación y la configuración de Vite: código de navegador, con React.
  //
  // Hasta la Fase 8 este bloque cubría `**/*.{ts,tsx}`, es decir, todo. Se ha
  // acotado a `src` y a `vite.config.ts` para que los tests de Playwright
  // tengan el suyo: son código de Node y no contienen ni un componente, así que
  // ni las globales del navegador ni las reglas de React les corresponden.
  {
    files: ['src/**/*.{ts,tsx}', 'vite.config.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      // Debe ir el último: desactiva las reglas de ESLint que chocan con
      // Prettier, para que no se corrijan mutuamente al guardar.
      prettier,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // Los tests de punta a punta y su configuración (Fase 8).
  //
  // Las globales son las de Node porque es ahí donde se ejecutan. El código que
  // sí corre en el navegador va dentro de `page.evaluate()`, y de eso se
  // encarga TypeScript con la librería `DOM` de `tsconfig.e2e.json`.
  {
    files: ['e2e/**/*.ts', 'playwright.config.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended, prettier],
    languageOptions: {
      globals: globals.node,
    },
  },
])
