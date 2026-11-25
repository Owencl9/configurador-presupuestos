import { QuantitySelector } from '../../shared/components/QuantitySelector'
import {
  MAX_MONTHS,
  MAX_QUANTITY,
  MIN_QUANTITY,
} from '../../shared/constants/business-rules'
import type { BudgetLine } from '../../shared/types/budget'
import { buildAmountLabel } from '../../shared/utils/buildAmountLabel'
import { calculateLineAmountCents } from '../../shared/utils/calculateLineAmountCents'
import { isMonthlyLine } from '../../shared/utils/isMonthlyLine'
import { buildCommitmentHint } from './buildCommitmentHint'

export interface BudgetLineItemProps {
  /** La línea que se muestra. */
  line: BudgetLine
  /** Se invoca con la cantidad nueva, ya corregida. */
  onQuantityChange: (quantity: number) => void
  /**
   * Se invoca con los meses nuevos, ya corregidos. Solo puede ocurrir en una
   * línea mensual: en las demás no se dibuja el selector.
   */
  onMonthsChange: (months: number) => void
  /** Se invoca al pulsar el botón de quitar. */
  onRemove: () => void
}

/**
 * Una línea del presupuesto: el servicio, su precio unitario, los selectores de
 * cantidad y de meses, el importe de la línea y el botón de quitarla.
 *
 * **No calcula nada.** El importe lo da `calculateLineAmountCents` y el texto
 * lo da `buildAmountLabel`, las dos con sus tests. Aquí no hay ni una
 * multiplicación ni una división entre cien (pendiente nº 12 de PROGRESO.md).
 *
 * El selector de meses **solo aparece en las líneas mensuales**, y quien decide
 * eso es `isMonthlyLine`: sin pasar por él, el tipo no deja ni leer `months`.
 * Un hosting anual no tiene permanencia en meses —su unidad es el año, y la
 * cantidad ya dice cuántos se contratan— y una web corporativa tampoco.
 *
 * Los límites de los selectores vienen de `business-rules.ts`, salvo el mínimo
 * de meses, que es el `minMonths` **del propio servicio**: 6 en los de SEO y 3
 * en los de mantenimiento.
 *
 * ## La pista del selector de meses (Fase 6)
 *
 * Bajo el selector de meses hay una pista que explica el descuento por
 * permanencia —«Desde 12 meses: 10 % de descuento», o «Descuento por
 * permanencia aplicado» cuando ya se cumple—, asociada al campo igual que su
 * rango. La pidió el usuario después de probar la Fase 5: cambiar los meses no
 * movía ningún importe y nada en pantalla decía para qué servía el campo
 * (pendiente nº 18 de PROGRESO.md).
 *
 * El texto lo decide `buildCommitmentHint`, que comparte la condición con la
 * estrategia que concede el descuento. Aquí no hay ninguna comparación de
 * meses: si la hubiera, habría dos versiones de la misma regla y la pantalla
 * podría anunciar un descuento que el presupuesto no lleva.
 */
export function BudgetLineItem({
  line,
  onQuantityChange,
  onMonthsChange,
  onRemove,
}: BudgetLineItemProps) {
  const { service, quantity } = line
  const importeCents = calculateLineAmountCents(line)

  return (
    /*
     * Tres columnas de ancho declarado a partir de 1024 px, y una sola columna
     * por debajo.
     *
     * La rejilla es lo que alinea los selectores de todas las líneas: con un
     * `flex` y `justify-between`, cada línea coloca sus cosas según lo que
     * miden, así que el selector de cantidad se desplazaba según el ancho del
     * importe («72,00 €/año» frente a «300,00 €») y según si la línea tiene uno
     * o dos selectores. Con la rejilla, las tres columnas miden lo mismo en
     * todas las líneas y el contenido se coloca dentro de su columna.
     *
     * El ancho de la columna de los selectores (23rem) deja sitio para los dos,
     * y el `flex-wrap` de dentro es la red de seguridad: si algún día no
     * cupieran, se apilan en lugar de desbordarse.
     *
     * La fila empieza en `lg` y no en `sm` a propósito. Entre 640 y 1024 px no
     * caben las tres columnas sin estrujar el nombre del servicio, así que en
     * ese rango se apila, igual que en el móvil.
     */
    <article className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 lg:grid lg:grid-cols-[1fr_23rem_12rem] lg:items-start lg:gap-6">
      <div className="min-w-0">
        <p className="font-semibold text-slate-900">{service.name}</p>
        <p className="text-sm text-slate-600">
          {buildAmountLabel(service.priceCents, service.payment)}
          <span className="sr-only"> por unidad</span>
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <QuantitySelector
          id={`cantidad-${service.id}`}
          label="Cantidad"
          itemName={service.name}
          unit="unidades"
          value={quantity}
          min={MIN_QUANTITY}
          max={MAX_QUANTITY}
          onChange={onQuantityChange}
        />

        {isMonthlyLine(line) && (
          <QuantitySelector
            id={`meses-${service.id}`}
            label="Meses"
            itemName={service.name}
            unit="meses"
            value={line.months}
            min={line.service.minMonths}
            max={MAX_MONTHS}
            /* La pista del descuento por permanencia (pendiente nº 18). El
               texto lo decide `buildCommitmentHint`, que comparte la condición
               con la estrategia que concede el descuento: así la pantalla no
               puede anunciar un descuento que el presupuesto no lleva.
               `?? undefined` porque aquí la línea siempre es mensual y la
               función nunca devuelve `null`, pero su tipo lo admite. */
            hint={buildCommitmentHint(line) ?? undefined}
            onChange={onMonthsChange}
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
        {/* `tabular-nums` da a todas las cifras el mismo ancho, así que los
            importes de varias líneas quedan alineados por la coma y no solo
            por el borde derecho. En una columna de dinero se nota. */}
        <p className="text-lg font-bold whitespace-nowrap text-slate-900 tabular-nums">
          {buildAmountLabel(importeCents, service.payment)}
        </p>

        <button
          type="button"
          onClick={onRemove}
          className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 underline transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          {/* El texto visible es corto y el accesible nombra el servicio, igual
              que en `ServiceCard`. Y es exactamente el mismo texto que usa el
              catálogo cuando el servicio está marcado, a propósito: es la misma
              acción vista desde dos sitios de la pantalla. */}
          <span aria-hidden="true">Quitar</span>
          <span className="sr-only">Quitar {service.name} del presupuesto</span>
        </button>
      </div>
    </article>
  )
}
