import type { BudgetLine } from '../../shared/types/budget'
import { formatEuros } from '../../shared/utils/formatEuros'
import { BudgetLineItem } from './BudgetLineItem'
import { BudgetSummary } from './BudgetSummary'
import { calculateBudget } from './calculateBudget'
import { calculateFirstPaymentCents } from './calculateFirstPaymentCents'

export interface BudgetPanelProps {
  /** Las líneas del presupuesto, en el orden en que se añadieron. */
  lines: readonly BudgetLine[]
  /** Se invoca con el identificador del servicio y la cantidad nueva. */
  onQuantityChange: (serviceId: string, quantity: number) => void
  /** Se invoca con el identificador del servicio y los meses nuevos. */
  onMonthsChange: (serviceId: string, months: number) => void
  /** Se invoca con el identificador del servicio que hay que quitar. */
  onRemove: (serviceId: string) => void
}

const ID_ENCABEZADO = 'presupuesto'
const ID_ESTADO = 'presupuesto-estado'

/**
 * El presupuesto en pantalla: las líneas, el resumen y una frase de estado.
 *
 * Es el componente que sustituye al contador provisional «Servicios
 * seleccionados» de la Fase 2 (pendiente nº 8 de PROGRESO.md).
 *
 * **No calcula nada.** Llama a `calculateBudget` con las líneas y a
 * `calculateFirstPaymentCents` con el resultado, y reparte lo que recibe. Las
 * dos son funciones probadas, y esta es la única puerta de entrada al cálculo
 * (pendiente nº 12).
 *
 * ## La frase de estado y el `aria-live`
 *
 * Una sola frase corta —cuántos servicios hay y cuánto se paga el primer día—
 * es la única parte de la pantalla que se anuncia al cambiar el presupuesto.
 * Decisión del usuario, y con un motivo claro: con el resumen entero como
 * región activa, cada pulsación de un botón haría que un lector de pantalla
 * recitara las quince cifras del desglose.
 *
 * La frase **está siempre en la página**, también con el presupuesto vacío. Una
 * región activa que aparece al mismo tiempo que su contenido no se anuncia de
 * forma fiable: tiene que existir antes del cambio para que el cambio se note.
 *
 * ## «A pagar el primer día (orientativo)»
 *
 * La etiqueta es literal y es deliberada. La aplicación no cobra nada ni tiene
 * medios de pago: calcula un presupuesto. Y la cifra tampoco es un total del
 * presupuesto —eso no existe, ver el [ADR 0007](../../../docs/adr/0007-redondeo-del-igic.md)—,
 * sino lo que coincide en el primer pago: el pago inicial, la primera cuota
 * mensual y el primer pago anual.
 */
export function BudgetPanel({
  lines,
  onQuantityChange,
  onMonthsChange,
  onRemove,
}: BudgetPanelProps) {
  const vacio = lines.length === 0

  const budget = calculateBudget(lines)
  const primerPagoCents = calculateFirstPaymentCents(budget)

  const servicios = `${lines.length} ${lines.length === 1 ? 'servicio' : 'servicios'} en el presupuesto.`
  const fraseDeEstado = vacio
    ? 'No hay servicios en el presupuesto.'
    : `${servicios} A pagar el primer día (orientativo): ${formatEuros(primerPagoCents)}`

  return (
    <section aria-labelledby={ID_ENCABEZADO}>
      <h2 id={ID_ENCABEZADO} className="text-xl font-semibold text-slate-900">
        Tu presupuesto
      </h2>

      <p id={ID_ESTADO} aria-live="polite" className="mt-2 text-slate-700">
        {fraseDeEstado}
      </p>

      {vacio ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
          Todavía no has añadido ningún servicio. Elige los que necesites en el
          catálogo y aquí verás el presupuesto con su desglose.
        </p>
      ) : (
        <>
          <ul className="mt-4 flex list-none flex-col gap-3 p-0">
            {lines.map((line) => (
              <li key={line.service.id}>
                <BudgetLineItem
                  line={line}
                  onQuantityChange={(quantity) =>
                    onQuantityChange(line.service.id, quantity)
                  }
                  onMonthsChange={(months) =>
                    onMonthsChange(line.service.id, months)
                  }
                  onRemove={() => onRemove(line.service.id)}
                />
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <BudgetSummary budget={budget} />
          </div>
        </>
      )}
    </section>
  )
}
