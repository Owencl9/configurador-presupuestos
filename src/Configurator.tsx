import { useBudget } from './context/BudgetContext'
import { BudgetPanel } from './features/budget/BudgetPanel'
import { ResetBudgetButton } from './features/budget/ResetBudgetButton'
import { ServiceCatalog } from './features/service-catalog/ServiceCatalog'

/**
 * La pantalla del configurador: el título, el catálogo y el presupuesto.
 *
 * Es el contenido que hasta la Fase 4 estaba dentro de `App`. Se ha separado
 * por un motivo concreto de React: **un componente no puede consumir un Context
 * que él mismo renderiza**. `App` pone el proveedor, y este componente, que está
 * dentro, es el primero que puede leerlo.
 *
 * ## Los componentes de abajo no conocen el Context
 *
 * `ServiceCatalog` y `BudgetPanel` reciben exactamente las mismas props que en
 * la Fase 4 y no han cambiado ni una línea. Este componente es el único que
 * llama a `useBudget`, y lo que hace con lo que recibe es repartirlo.
 *
 * Es deliberado y tiene dos ventajas que se notan en los tests: los componentes
 * de presentación se prueban pasándoles props, sin montar ningún proveedor, y
 * se pueden reutilizar en la Fase 7 dentro del documento imprimible, donde el
 * presupuesto se enseña pero no se edita.
 */
export function Configurator() {
  const {
    lines,
    selectedIds,
    toggleService,
    changeQuantity,
    changeMonths,
    removeService,
    reset,
  } = useBudget()

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
          <ServiceCatalog selectedIds={selectedIds} onToggle={toggleService} />
        </div>

        <div className="mt-12">
          <BudgetPanel
            lines={lines}
            onQuantityChange={changeQuantity}
            onMonthsChange={changeMonths}
            onRemove={removeService}
          />

          {/*
           * Fuera de `BudgetPanel` a propósito: borrar el presupuesto entero no
           * es parte del resumen, y así el panel —que tiene sus doce tests y se
           * reutiliza en la Fase 7— no ha tenido que cambiar para que esta fase
           * añada un botón.
           */}
          <ResetBudgetButton hasLines={lines.length > 0} onReset={reset} />
        </div>
      </main>
    </div>
  )
}
