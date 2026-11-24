// Configuración común a todos los tests. La carga Vitest mediante
// `setupFiles` en vite.config.ts, antes de cada archivo de test.

// Añade los matchers de jest-dom a `expect`, por ejemplo
// `toBeInTheDocument()` o `toHaveAccessibleName()`.
import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

// Desmonta lo renderizado tras cada test. Sin esto, los componentes de un
// test siguen en el DOM durante el siguiente y las búsquedas por texto
// encuentran varias coincidencias.
afterEach(() => {
  cleanup()
})

/*
 * Vacía el `localStorage` antes de cada test (Fase 5).
 *
 * Hace falta desde el momento en que la aplicación guarda borradores: el
 * navegador simulado por jsdom tiene **un solo** `localStorage` para todo el
 * archivo de test, así que un test que añade servicios dejaría su borrador
 * dentro y el siguiente arrancaría con el presupuesto del anterior. Esto no es
 * una comodidad: un test que depende de lo que hizo el anterior ya no prueba
 * lo que dice su nombre, y además falla o pasa según el orden de ejecución.
 */
beforeEach(() => {
  localStorage.clear()
})
