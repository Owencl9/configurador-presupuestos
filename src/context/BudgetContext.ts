import { createContext, useContext } from 'react'

import type { BudgetLine } from '../shared/types/budget'

/**
 * Lo que el presupuesto ofrece a cualquier componente de la aplicación.
 *
 * Son las líneas, los identificadores marcados y las cinco acciones. **Las
 * acciones se exponen como funciones con nombre, no como el `dispatch` del
 * reducer**, y es una decisión con dos consecuencias buenas:
 *
 * 1. Los componentes de la Fase 4 encajan sin cambiar: `ServiceCatalog` espera
 *    una función `(serviceId: string) => void` y aquí hay una.
 * 2. La traducción de identificador a servicio del catálogo ocurre **una sola
 *    vez**, dentro del proveedor. Si los componentes construyeran las acciones,
 *    cada uno necesitaría el catálogo a mano para poder añadir una línea.
 */
export interface BudgetContextValue {
  /** Las líneas del presupuesto, en el orden en que se añadieron. */
  readonly lines: readonly BudgetLine[]
  /**
   * Los identificadores de los servicios que están en el presupuesto.
   *
   * **Se derivan de las líneas**, no son una segunda lista: así es imposible
   * que el catálogo muestre marcado un servicio que no está en el presupuesto.
   */
  readonly selectedIds: readonly string[]
  /** Añade el servicio si no está; lo quita si está. */
  readonly toggleService: (serviceId: string) => void
  /** Cambia las unidades de una línea. */
  readonly changeQuantity: (serviceId: string, quantity: number) => void
  /** Cambia los meses de una línea mensual. */
  readonly changeMonths: (serviceId: string, months: number) => void
  /** Quita una línea del presupuesto. */
  readonly removeService: (serviceId: string) => void
  /** Vacía el presupuesto y borra el borrador guardado. */
  readonly reset: () => void
}

/**
 * El Context del presupuesto.
 *
 * El valor inicial es `null` **a propósito**, en lugar de un presupuesto vacío
 * de mentira: así `useBudget` puede distinguir «no hay proveedor» de «hay un
 * proveedor y el presupuesto está vacío». Con un valor inicial verosímil, un
 * componente colocado fuera del proveedor funcionaría a medias —vería un
 * presupuesto que nunca cambia— y eso es mucho más difícil de diagnosticar que
 * un error al arrancar.
 *
 * Este archivo es `.ts` y no `.tsx` por una razón práctica: la regla
 * `react-refresh/only-export-components` de ESLint avisa cuando un archivo con
 * componentes exporta además otras cosas, porque entonces el recargado en
 * caliente de Vite no puede actualizar la pantalla sin perder el estado. El
 * Context y su hook viven aquí, y el componente en `BudgetProvider.tsx`.
 */
export const BudgetContext = createContext<BudgetContextValue | null>(null)

/**
 * Da acceso al presupuesto desde cualquier componente que esté dentro de
 * `<BudgetProvider>`.
 *
 * Es un *hook*: una función que solo se puede llamar desde un componente de
 * React, y que por convención se llama `useAlgo`. Esta no guarda estado propio,
 * solo lee el del proveedor.
 *
 * Lanza si se usa fuera del proveedor. Es deliberado y es lo contrario de lo
 * que hace el resto del proyecto con los datos que no son de fiar: aquí no hay
 * datos de nadie, hay un componente colocado donde no debe, y eso es un error
 * de programación que tiene que aparecer en el primer render y no convertirse
 * en una pantalla que no responde.
 */
export function useBudget(): BudgetContextValue {
  const valor = useContext(BudgetContext)

  if (valor === null) {
    throw new Error(
      'useBudget solo funciona dentro de <BudgetProvider>. Falta el proveedor por encima de este componente.',
    )
  }

  return valor
}
