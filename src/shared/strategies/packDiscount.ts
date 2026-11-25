import {
  PACK_DISCOUNT_MIN_SERVICES,
  PACK_DISCOUNT_PERCENT,
} from '../constants/business-rules'
import type { BudgetLine } from '../types/budget'
import { calculatePercentCents } from '../utils/calculatePercentCents'
import type {
  BlockDiscount,
  DiscountStrategy,
  PaymentBlockKey,
} from './discountStrategy'
import { PAYMENT_BLOCK_KEYS } from './discountStrategy'

/**
 * Cuenta cuántos servicios **distintos** hay en el presupuesto.
 *
 * Distintos por identificador, no por línea ni por unidades. Es la parte de la
 * regla del pack que el usuario fijó expresamente al abrir la Fase 6: *tres
 * unidades de la misma web no son un pack*. El descuento premia la variedad de
 * la contratación, no su importe —de eso se encarga el descuento por importe—,
 * así que 3 × la misma tienda no lo activa y 2.500 € repartidos en tres
 * servicios sí.
 *
 * Se cuenta por identificador y no por posición porque `calculateBudget` acepta
 * cualquier lista de líneas. El estado de la aplicación no puede tener dos
 * líneas del mismo servicio —lo impide el reducer de la Fase 5—, pero el
 * cálculo no depende de que eso siga siendo cierto.
 */
export function countDistinctServices(lines: readonly BudgetLine[]): number {
  return new Set(lines.map((line) => line.service.id)).size
}

/** El motivo que se muestra en el resumen, construido con las constantes. */
const MOTIVO = `Pack de ${PACK_DISCOUNT_MIN_SERVICES} servicios o más (${PACK_DISCOUNT_PERCENT} %)`

/**
 * **Descuento por pack**: si el presupuesto incluye tres o más servicios
 * distintos, un 5 % sobre el subtotal de **cada bloque de pago**.
 *
 * ## Por qué a los tres bloques y no a uno
 *
 * La regla del apartado 4.3 dice «5 % sobre el subtotal», y en este proyecto
 * hay tres subtotales: el pago inicial, la cuota mensual y el pago anual. No
 * existe un total único al que aplicarlo, y crearlo para esto sería inventar
 * una cifra que el cliente no paga en ningún momento
 * ([ADR 0007](../../../docs/adr/0007-redondeo-del-igic.md)).
 *
 * Decisión del usuario (pendiente nº 11 de PROGRESO.md): se aplica a los tres
 * por separado. La condición se evalúa **sobre todo el presupuesto** —tres
 * servicios distintos, de cualquier forma de pago— y el porcentaje se aplica a
 * cada bloque. Así un presupuesto de tienda + SEO + hosting lleva el 5 % en los
 * tres bloques aunque cada bloque tenga una sola línea, que es exactamente lo
 * que un cliente entiende por «me hacen descuento por contratar el pack».
 *
 * Un bloque sin importe no produce descuento: devolver 0,00 € dejaría una fila
 * vacía en el resumen.
 */
export const packDiscount: DiscountStrategy = ({ lines, subtotalsCents }) => {
  if (countDistinctServices(lines) < PACK_DISCOUNT_MIN_SERVICES) {
    return []
  }

  const descuentos: BlockDiscount[] = []

  for (const block of PAYMENT_BLOCK_KEYS) {
    const amountCents = calculatePercentCents(
      subtotalsCents[block],
      PACK_DISCOUNT_PERCENT,
    )

    if (amountCents > 0) {
      descuentos.push(descuentoDePack(block, amountCents))
    }
  }

  return descuentos
}

function descuentoDePack(
  block: PaymentBlockKey,
  amountCents: number,
): BlockDiscount {
  return { id: 'pack', label: MOTIVO, block, amountCents }
}
