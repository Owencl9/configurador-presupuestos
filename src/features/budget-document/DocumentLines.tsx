import type { BudgetLine } from '../../shared/types/budget'
import { buildAmountLabel } from '../../shared/utils/buildAmountLabel'
import { calculateLineAmountCents } from '../../shared/utils/calculateLineAmountCents'
import { isMonthlyLine } from '../../shared/utils/isMonthlyLine'

export interface DocumentLinesProps {
  /** Las líneas del presupuesto, en el orden en que se añadieron. */
  readonly lines: readonly BudgetLine[]
}

/**
 * Los servicios del presupuesto, **en modo lectura**, para el documento.
 *
 * ## Por qué no reutiliza `BudgetLineItem`
 *
 * Porque la línea del configurador trae lo que aquí no puede haber: el botón de
 * quitar y los selectores de cantidad y meses. Esconderlos con CSS de impresión
 * sería peor de lo que parece —seguirían estando en la pantalla del documento y
 * en el recorrido del teclado, y se podrían pulsar—, así que este componente no
 * dibuja ningún botón ni ningún campo. Hay un test para cada una de las dos
 * cosas.
 *
 * Lo que **sí** se reutiliza es todo el cálculo: `calculateLineAmountCents` da
 * el importe y `buildAmountLabel` le pone su sufijo, las mismas funciones que
 * usa la pantalla. Aquí no hay ni una multiplicación (pendiente nº 12).
 *
 * ## Lo que no se muestra
 *
 * **Meses × cuota.** Está decidido en el
 * [ADR 0011](../../../docs/adr/0011-sin-compromiso-total.md), que señala esta
 * fase como su momento de riesgo: una tabla con una columna de meses y otra de
 * cuota pide a gritos una tercera columna con el producto. No la tiene, y hay un
 * test que lo vigila.
 */
export function DocumentLines({ lines }: DocumentLinesProps) {
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {lines.map((line) => {
        const { service, quantity } = line
        const unidades = quantity === 1 ? 'unidad' : 'unidades'

        return (
          <li
            key={service.id}
            /*
             * `break-inside-avoid` es una utilidad de Tailwind que impide que el
             * salto de página parta una línea en dos. Es de impresión, pero va
             * aquí y no en el CSS de impresión porque es una propiedad del
             * elemento, no un estilo global de la hoja.
             */
            className="flex break-inside-avoid flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-baseline sm:justify-between"
          >
            <div>
              <p className="font-medium text-slate-900">{service.name}</p>
              <p className="text-sm text-slate-600">
                {quantity} {unidades} ×{' '}
                {buildAmountLabel(service.priceCents, service.payment)}
                {/* Los meses solo existen en una línea mensual, y el acceso
                    pasa por el predicado de tipo de la Fase 4: el
                    discriminante está anidado dentro de `service`, así que
                    TypeScript no estrecha la unión sin él. */}
                {isMonthlyLine(line) && <> · {line.months} meses</>}
              </p>
            </div>

            <p className="font-semibold text-slate-900 tabular-nums">
              {buildAmountLabel(
                calculateLineAmountCents(line),
                service.payment,
              )}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
