// Configuración común a todos los tests. La carga Vitest mediante
// `setupFiles` en vite.config.ts, antes de cada archivo de test.

// Añade los matchers de jest-dom a `expect`, por ejemplo
// `toBeInTheDocument()` o `toHaveAccessibleName()`.
import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Desmonta lo renderizado tras cada test. Sin esto, los componentes de un
// test siguen en el DOM durante el siguiente y las búsquedas por texto
// encuentran varias coincidencias.
afterEach(() => {
  cleanup()
})
