import { createBudgetLine } from '../features/budget/createBudgetLine'
import { isMonthlyLine } from '../shared/utils/isMonthlyLine'
import type { BudgetLine } from '../shared/types/budget'
import type { Service } from '../shared/types/service'

/**
 * El estado del presupuesto: **las líneas, y nada más**.
 *
 * No hay una segunda lista con los identificadores marcados del catálogo. Se
 * derivan de las líneas (`BudgetProvider`), así que es imposible que el catálogo
 * muestre marcado un servicio que no está en el presupuesto. Es la decisión que
 * ya tomó la Fase 4 y que aquí no cambia.
 *
 * Los datos del cliente (Fase 7) **no están aquí** y la decisión de si entran
 * está sin tomar. Si entraran, este tipo pasaría a ser un objeto con las líneas
 * en un campo.
 */
export type BudgetState = readonly BudgetLine[]

/**
 * Las cinco cosas que se pueden hacer con un presupuesto.
 *
 * Es una **unión discriminada** por `type`, con el mismo criterio que `Service`
 * y `BudgetLine`: cada acción declara exactamente los datos que necesita, así
 * que despachar `change-quantity` sin la cantidad no compila. Las garantías
 * están probadas con `@ts-expect-error` en `budgetReducer.test.ts`.
 *
 * `toggle-service` lleva el **servicio entero**, no su identificador, y es una
 * decisión con consecuencias: el reducer no necesita conocer el catálogo para
 * crear una línea, así que se puede probar con servicios inventados y no se
 * acopla a `shared/data/services.ts`. La traducción de identificador a servicio
 * ocurre en un único sitio, `BudgetProvider`, que es quien sí conoce el
 * catálogo.
 */
export type BudgetAction =
  | { readonly type: 'toggle-service'; readonly service: Service }
  | {
      readonly type: 'change-quantity'
      readonly serviceId: string
      readonly quantity: number
    }
  | {
      readonly type: 'change-months'
      readonly serviceId: string
      readonly months: number
    }
  | { readonly type: 'remove-service'; readonly serviceId: string }
  | { readonly type: 'reset' }

/**
 * El estado del presupuesto y cómo cambia. **Función pura.**
 *
 * Recibe el estado actual y una acción, y devuelve el estado nuevo. No lee ni
 * escribe nada de fuera: ni `localStorage`, ni la hora, ni el catálogo. Eso es
 * lo que permite probarla con `expect(reducer(estado, accion)).toEqual(...)`,
 * sin navegador y sin componentes, igual que `calculateSubtotals`.
 *
 * **Nunca modifica el estado que recibe**, y no es una cuestión de estilo: React
 * compara la referencia del estado nuevo con la del anterior para decidir si
 * hay que volver a dibujar. Un array modificado en su sitio tiene la misma
 * referencia, así que la pantalla se quedaría como estaba. Hay dos tests con
 * `Object.freeze` que lo vigilan.
 */
export function budgetReducer(
  state: BudgetState,
  action: BudgetAction,
): BudgetState {
  switch (action.type) {
    case 'toggle-service': {
      const { service } = action

      if (state.some((linea) => linea.service.id === service.id)) {
        return state.filter((linea) => linea.service.id !== service.id)
      }

      /*
       * `createBudgetLine` es el único sitio del proyecto que decide con qué
       * valores nace una línea, incluidos los meses mínimos de un servicio
       * mensual. Por eso quitar y volver a añadir un servicio lo devuelve con
       * su cantidad y sus meses iniciales: el estado de una línea que no está
       * en el presupuesto no se guarda en ningún sitio.
       */
      return [...state, createBudgetLine(service)]
    }

    case 'change-quantity': {
      const { serviceId, quantity } = action

      return state.map((linea) =>
        linea.service.id === serviceId ? { ...linea, quantity } : linea,
      )
    }

    case 'change-months': {
      const { serviceId, months } = action

      /*
       * `isMonthlyLine` no es una precaución de más: es lo que impide escribir
       * `months` en una línea de pago único o anual, que es el dato imposible
       * que el tipo `BudgetLine` no puede detener por tener el discriminante
       * anidado (ver la nota de `shared/types/budget.ts`).
       */
      return state.map((linea) =>
        linea.service.id === serviceId && isMonthlyLine(linea)
          ? { ...linea, months }
          : linea,
      )
    }

    case 'remove-service': {
      const { serviceId } = action

      return state.filter((linea) => linea.service.id !== serviceId)
    }

    case 'reset':
      return []

    default: {
      /*
       * Rama inalcanzable mientras el `switch` cubra toda la unión, y ahí está
       * su utilidad: `action` vale `never` aquí, así que si algún día se añade
       * una acción y se olvida su `case`, esta asignación deja de compilar y el
       * error aparece en este archivo, que es donde hay que decidir qué hace
       * esa acción.
       *
       * Lanza en lugar de devolver el estado, igual que `createBudgetLine` y
       * `calculateSubtotals`: una acción que no existe es un error de
       * programación nuestro —ningún dato del navegador llega hasta aquí—, y un
       * error silencioso sería un botón que no hace nada y nadie sabe por qué.
       */
      const accionNoCubierta: never = action
      throw new Error(
        `Acción del presupuesto no contemplada: ${JSON.stringify(accionNoCubierta)}`,
      )
    }
  }
}
