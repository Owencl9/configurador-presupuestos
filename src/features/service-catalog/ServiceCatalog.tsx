import { ServiceCard } from '../../shared/components/ServiceCard'
import { CATEGORIES, SERVICES } from '../../shared/data/services'
import { buildPriceLabel } from './buildPriceLabel'
import { groupServicesByCategory } from './groupServicesByCategory'

export interface ServiceCatalogProps {
  /** Identificadores de los servicios ya incluidos en el presupuesto. */
  selectedIds: readonly string[]
  /** Se invoca con el identificador del servicio que hay que añadir o quitar. */
  onToggle: (serviceId: string) => void
}

/**
 * Catálogo completo de servicios, agrupado por categorías.
 *
 * Importa el catálogo directamente en lugar de recibirlo por props: en esta
 * aplicación hay un único catálogo y no está previsto que haya un segundo, así
 * que una prop para inyectarlo sería un parámetro sin ningún uso real. Lo que
 * sí recibe por props es el estado —qué está seleccionado— y a quién avisar,
 * para no acoplarlo al presupuesto. La agrupación y el formato del precio viven
 * en funciones aparte, con sus propios tests, y este componente solo decide
 * cómo se colocan en pantalla.
 *
 * En la Fase 2 `selectedIds` y `onToggle` los proporciona el `useState` de
 * `App.tsx`: seleccionar un servicio todavía no calcula nada. El estado global
 * del presupuesto llega en la Fase 5, y entonces solo cambia quién pasa esas
 * dos props, no este componente.
 */
export function ServiceCatalog({ selectedIds, onToggle }: ServiceCatalogProps) {
  const grupos = groupServicesByCategory(SERVICES, CATEGORIES)

  return (
    <div className="flex flex-col gap-10">
      {grupos.map(({ category, services }) => {
        // Vincula la sección con su encabezado: así la región toma el nombre
        // de la categoría y un lector de pantalla puede anunciarla y saltar a
        // ella. El identificador se construye con el de la categoría, que el
        // test de integridad garantiza único.
        const idEncabezado = `categoria-${category.id}`

        return (
          <section key={category.id} aria-labelledby={idEncabezado}>
            <h2
              id={idEncabezado}
              className="text-xl font-semibold text-slate-900"
            >
              {category.label}
            </h2>

            <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <li key={service.id}>
                  <ServiceCard
                    name={service.name}
                    description={service.description}
                    priceLabel={buildPriceLabel(service)}
                    selected={selectedIds.includes(service.id)}
                    onToggle={() => onToggle(service.id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
