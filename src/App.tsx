import { useState } from 'react'

import { ServiceCatalog } from './features/service-catalog/ServiceCatalog'

function App() {
  /*
   * Estado provisional de la Fase 2: solo guarda qué servicios están marcados,
   * para poder ver el catálogo funcionando. Todavía no hay presupuesto ni
   * cálculo. En la Fase 5 este `useState` se sustituye por el Context con
   * useReducer, y `ServiceCatalog` no tendrá que cambiar: seguirá recibiendo
   * los mismos `selectedIds` y `onToggle`, solo cambiará quién se los pasa.
   */
  const [seleccionados, setSeleccionados] = useState<string[]>([])

  function alternarServicio(id: string) {
    setSeleccionados((actuales) =>
      actuales.includes(id)
        ? actuales.filter((seleccionado) => seleccionado !== id)
        : [...actuales, id],
    )
  }

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

        {/* Contador provisional, en lugar del resumen del presupuesto. El
            resumen con pago inicial, cuota mensual, descuentos, IGIC y total
            es la Fase 4. `aria-live` hace que un lector de pantalla anuncie el
            cambio al marcar un servicio, sin tener que ir a buscarlo. */}
        <p className="mt-10 text-sm text-slate-500" aria-live="polite">
          Servicios seleccionados: {seleccionados.length}
        </p>
      </main>
    </div>
  )
}

export default App
