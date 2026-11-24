import { useState } from 'react'

import { ServiceCard } from './shared/components/ServiceCard'

/**
 * Datos provisionales, solo para ver el ServiceCard en pantalla al terminar la
 * Fase 1. El catálogo real, con sus tipos y su archivo de datos, se construye
 * en la Fase 2; los precios definitivos se confirman en la Fase 3.
 */
const SERVICIOS_PROVISIONALES = [
  {
    id: 'web-corporativa',
    name: 'Web corporativa',
    description: 'Sitio web de hasta 5 páginas, adaptado a móvil.',
    priceLabel: '1.200,00 €',
  },
  {
    id: 'seo',
    name: 'Posicionamiento SEO',
    description: 'Optimización y contenidos. Mínimo 6 meses.',
    priceLabel: '350,00 €/mes',
  },
  {
    id: 'hosting',
    name: 'Hosting y dominio',
    description: 'Alojamiento, certificado SSL y copias de seguridad.',
    priceLabel: '120,00 €/año',
  },
]

function App() {
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

        <h2 className="mt-10 text-xl font-semibold text-slate-900">
          Servicios
        </h2>
        <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS_PROVISIONALES.map((servicio) => (
            <li key={servicio.id}>
              <ServiceCard
                name={servicio.name}
                description={servicio.description}
                priceLabel={servicio.priceLabel}
                selected={seleccionados.includes(servicio.id)}
                onToggle={() => alternarServicio(servicio.id)}
              />
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-slate-500">
          Servicios seleccionados: {seleccionados.length}
        </p>
      </main>
    </div>
  )
}

export default App
