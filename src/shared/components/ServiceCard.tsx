export interface ServiceCardProps {
  /** Nombre del servicio. Se muestra como encabezado de la tarjeta. */
  name: string
  /** Descripción breve del servicio. */
  description: string
  /**
   * Precio ya formateado para mostrar, por ejemplo `1.200,00 €` o `350,00 €/mes`.
   *
   * El componente no formatea ni calcula: recibe el texto hecho. El formateo de
   * euros a partir de céntimos es lógica de negocio y se implementa con su
   * propio TDD en la Fase 3.
   */
  priceLabel: string
  /** Si el servicio ya está incluido en el presupuesto. */
  selected: boolean
  /** Se invoca al pulsar el botón, para añadir o quitar el servicio. */
  onToggle: () => void
}

/**
 * Tarjeta de un servicio del catálogo, con un botón para añadirlo o quitarlo
 * del presupuesto.
 *
 * Componente presentacional: no tiene estado propio ni conoce el presupuesto.
 * Recibe qué mostrar y a quién avisar, lo que permite probarlo de forma aislada.
 */
export function ServiceCard({
  name,
  description,
  priceLabel,
  selected,
  onToggle,
}: ServiceCardProps) {
  const textoVisible = selected ? 'Quitar' : 'Añadir'
  const nombreAccesible = selected
    ? `Quitar ${name} del presupuesto`
    : `Añadir ${name} al presupuesto`

  return (
    <article className="flex h-full flex-col gap-2 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
      <p className="flex-1 text-sm text-slate-600">{description}</p>
      <p className="text-xl font-bold text-slate-900">{priceLabel}</p>
      <button
        type="button"
        /* aria-pressed convierte el botón en un interruptor: un lector de
           pantalla anuncia si el servicio está o no incluido, sin depender
           del color. */
        aria-pressed={selected}
        onClick={onToggle}
        className={`mt-2 cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
          selected
            ? 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            : 'bg-slate-900 text-white hover:bg-slate-700'
        }`}
      >
        {/* El texto visible es corto para no saturar la tarjeta, pero el nombre
            accesible del botón nombra el servicio: con varias tarjetas en
            pantalla, «Añadir» a secas no identifica a qué servicio se refiere.
            El texto visible está contenido en el accesible, como exige el
            criterio WCAG 2.5.3 (Label in Name). */}
        <span aria-hidden="true">{textoVisible}</span>
        <span className="sr-only">{nombreAccesible}</span>
      </button>
    </article>
  )
}
