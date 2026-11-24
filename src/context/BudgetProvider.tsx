import type { ReactNode } from 'react'
import { useEffect, useMemo, useReducer } from 'react'

import { loadDraftLines, saveDraftLines } from '../features/budget/draftStorage'
import { SERVICES } from '../shared/data/services'
import type { Service } from '../shared/types/service'
import type { BudgetContextValue } from './BudgetContext'
import { BudgetContext } from './BudgetContext'
import { budgetReducer } from './budgetReducer'

export interface BudgetProviderProps {
  readonly children: ReactNode
  /**
   * El catálogo con el que se resuelven los identificadores de servicio.
   *
   * Tiene valor por defecto —el catálogo real— porque la aplicación solo tiene
   * uno. Es un parámetro para que los tests puedan pasar un catálogo de dos
   * servicios inventados: así no dependen de las tarifas reales y, sobre todo,
   * pueden provocar el caso «el borrador menciona un servicio que no existe»,
   * que con el catálogo real es imposible de construir sin inventar un
   * identificador y confiar en que nunca se añada.
   */
  readonly services?: readonly Service[]
}

/**
 * El estado del presupuesto, en un solo sitio y disponible para toda la
 * aplicación.
 *
 * Sustituye al `useState` de `App.tsx` de la Fase 4, y es el único componente
 * del proyecto con efectos secundarios: lee el borrador al arrancar y lo guarda
 * cuando cambia el presupuesto. Todo lo demás —el reducer, la validación del
 * borrador, el cálculo— son funciones puras.
 *
 * ## El borrador se lee **al crear el estado**, no en un efecto
 *
 * La tercera forma de `useReducer` recibe un valor y una función que lo
 * convierte en el estado inicial, y React la llama **una sola vez**, antes del
 * primer render. Eso es lo que llama «inicialización perezosa», y aquí no es un
 * detalle de rendimiento, es lo que hace correcto el guardado:
 *
 * | Dónde se lee el borrador | Qué pasa en el primer render |
 * | --- | --- |
 * | Al crear el estado (así está hecho) | el estado nace con las líneas recuperadas: nunca existe un instante en que el presupuesto valga «vacío» |
 * | En un efecto posterior | el primer render tiene el presupuesto vacío, y el efecto que guarda **borraría el borrador antes de leerlo** |
 *
 * Hay dos tests que lo vigilan, uno de ellos con `StrictMode`, que en
 * desarrollo monta los componentes y ejecuta los efectos dos veces.
 */
export function BudgetProvider({
  children,
  services = SERVICES,
}: BudgetProviderProps) {
  const [lines, dispatch] = useReducer(budgetReducer, services, loadDraftLines)

  /*
   * Guardar es un efecto y no parte de cada acción: así hay **un solo** sitio
   * que escribe, en lugar de cinco que podrían olvidarse. Se ejecuta cuando
   * `lines` cambia de referencia, que es precisamente cuando el reducer ha
   * devuelto un estado nuevo.
   *
   * El guardado del primer render escribe lo mismo que se acaba de leer, así
   * que no hace daño, y tiene un efecto útil: si el borrador traía líneas
   * inválidas que `parseDraft` descartó, lo guardado queda ya limpio.
   */
  useEffect(() => {
    saveDraftLines(lines)
  }, [lines])

  const valor = useMemo<BudgetContextValue>(
    () => ({
      lines,
      selectedIds: lines.map((linea) => linea.service.id),

      toggleService: (serviceId) => {
        const service = services.find((candidato) => candidato.id === serviceId)

        /*
         * Aquí está la única traducción de identificador a servicio del
         * proyecto, y por eso el reducer no necesita conocer el catálogo.
         *
         * No debería fallar nunca: los identificadores los emite el propio
         * catálogo. Se comprueba de todas formas porque la alternativa sería
         * una aserción de tipo, que es una promesa al compilador que nadie
         * verifica.
         */
        if (!service) {
          return
        }

        dispatch({ type: 'toggle-service', service })
      },

      changeQuantity: (serviceId, quantity) => {
        dispatch({ type: 'change-quantity', serviceId, quantity })
      },

      changeMonths: (serviceId, months) => {
        dispatch({ type: 'change-months', serviceId, months })
      },

      removeService: (serviceId) => {
        dispatch({ type: 'remove-service', serviceId })
      },

      reset: () => {
        dispatch({ type: 'reset' })
      },
    }),
    [lines, services],
  )

  return (
    <BudgetContext.Provider value={valor}>{children}</BudgetContext.Provider>
  )
}
