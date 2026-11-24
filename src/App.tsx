import { useState } from 'react'

import { BudgetPanel } from './features/budget/BudgetPanel'
import { createBudgetLine } from './features/budget/createBudgetLine'
import { isMonthlyLine } from './features/budget/isMonthlyLine'
import { ServiceCatalog } from './features/service-catalog/ServiceCatalog'
import { SERVICES } from './shared/data/services'
import type { BudgetLine } from './shared/types/budget'

function App() {
  /*
   * Las líneas del presupuesto. Es el estado de la Fase 4 y sigue siendo
   * provisional: en la Fase 5 lo sustituye un Context con useReducer, y
   * entonces estas cuatro funciones pasan a ser las acciones del reducer.
   *
   * Ninguno de los dos componentes de abajo tendrá que cambiar: `ServiceCatalog`
   * seguirá recibiendo `selectedIds` y `onToggle`, y `BudgetPanel` seguirá
   * recibiendo las líneas y sus tres avisos. Solo cambiará quién se los pasa.
   *
   * El estado son **las líneas**, no los identificadores seleccionados. Es el
   * cambio de la Fase 2 a la Fase 4: ahora cada servicio elegido lleva consigo
   * su cantidad y, si es mensual, sus meses. Los identificadores marcados del
   * catálogo se derivan de las líneas, así que no hay dos listas que puedan
   * discrepar: es imposible que el catálogo muestre un servicio marcado que no
   * esté en el presupuesto.
   */
  const [lineas, setLineas] = useState<readonly BudgetLine[]>([])

  function alternarServicio(serviceId: string) {
    setLineas((actuales) => {
      if (actuales.some((linea) => linea.service.id === serviceId)) {
        return actuales.filter((linea) => linea.service.id !== serviceId)
      }

      const service = SERVICES.find((candidato) => candidato.id === serviceId)

      /*
       * No puede ocurrir: los identificadores los emite el propio catálogo a
       * partir de `SERVICES`. Se comprueba de todas formas porque la
       * alternativa sería una aserción de tipo, y una aserción es una promesa
       * al compilador que nadie verifica. Esto no rompe nada si algún día esa
       * promesa deja de ser cierta.
       */
      if (!service) {
        return actuales
      }

      // `createBudgetLine` es el único sitio que decide con qué valores nace
      // una línea, incluidos los meses mínimos de un servicio mensual.
      return [...actuales, createBudgetLine(service)]
    })
  }

  function cambiarCantidad(serviceId: string, quantity: number) {
    setLineas((actuales) =>
      actuales.map((linea) =>
        linea.service.id === serviceId ? { ...linea, quantity } : linea,
      ),
    )
  }

  function cambiarMeses(serviceId: string, months: number) {
    setLineas((actuales) =>
      actuales.map((linea) =>
        linea.service.id === serviceId && isMonthlyLine(linea)
          ? { ...linea, months }
          : linea,
      ),
    )
  }

  function quitarServicio(serviceId: string) {
    setLineas((actuales) =>
      actuales.filter((linea) => linea.service.id !== serviceId),
    )
  }

  const seleccionados = lineas.map((linea) => linea.service.id)

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900">
          Configurador de Presupuestos
        </h1>
        <p className="mt-2 text-slate-600">
          Selecciona los servicios y obtén el presupuesto calculado
          automáticamente.
        </p>

        <div className="mt-10">
          <ServiceCatalog
            selectedIds={seleccionados}
            onToggle={alternarServicio}
          />
        </div>

        <div className="mt-12">
          <BudgetPanel
            lines={lineas}
            onQuantityChange={cambiarCantidad}
            onMonthsChange={cambiarMeses}
            onRemove={quitarServicio}
          />
        </div>
      </main>
    </div>
  )
}

export default App
