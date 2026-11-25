import {
  COMMITMENT_DISCOUNT_MIN_MONTHS,
  COMMITMENT_DISCOUNT_PERCENT,
} from '../constants/business-rules'
import type { BudgetLine } from '../types/budget'
import { calculateLineAmountCents } from '../utils/calculateLineAmountCents'
import { calculatePercentCents } from '../utils/calculatePercentCents'
import { isMonthlyLine } from '../utils/isMonthlyLine'
import type { DiscountStrategy } from './discountStrategy'

/**
 * Indica si una línea del presupuesto tiene derecho al descuento por
 * permanencia: es mensual y se contrata por doce meses o más.
 *
 * **Se exporta a propósito, y es importante que sea una sola función.** La usan
 * dos sitios que tienen que decir lo mismo:
 *
 * 1. Esta estrategia, para calcular el descuento.
 * 2. La pista que aparece bajo el selector de meses
 *    (`features/budget/buildCommitmentHint.ts`), que le dice al usuario si ya
 *    tiene el descuento o cuántos meses le faltan.
 *
 * Con la condición escrita dos veces, la pantalla podría decir «descuento
 * aplicado» con un presupuesto que no lo lleva. Es el mismo criterio que la
 * Fase 5 aplicó al estado: lo que se puede derivar no se duplica.
 *
 * El límite es **inclusivo**: doce meses justos cumplen. Al contrario que el
 * umbral del descuento por importe, que es estricto. Las dos cosas están así
 * porque así lo dice el apartado 4.3 —«contratados 12 meses o más» frente a
 * «si el pago único supera 3.000 €»— y cada una tiene su test.
 */
export function qualifiesForCommitmentDiscount(line: BudgetLine): boolean {
  return isMonthlyLine(line) && line.months >= COMMITMENT_DISCOUNT_MIN_MONTHS
}

/** El motivo que se muestra en el resumen, construido con las constantes. */
const MOTIVO = `Permanencia de ${COMMITMENT_DISCOUNT_MIN_MONTHS} meses o más (${COMMITMENT_DISCOUNT_PERCENT} %)`

/**
 * **Descuento por permanencia**: un 10 % sobre las líneas mensuales
 * contratadas doce meses o más, dentro del bloque de la cuota mensual.
 *
 * ## Qué lo distingue del pack
 *
 * El pack se aplica al subtotal completo de cada bloque. Este **no**: su base
 * son solo las líneas que cumplen la permanencia, no todo el subtotal mensual.
 * Un presupuesto con SEO a 12 meses y mantenimiento a 3 descuenta el 10 % del
 * SEO y nada del mantenimiento, porque el apartado 4.3 dice «10 % sobre esos
 * servicios» y no «sobre el subtotal». Por eso la estrategia recibe las líneas
 * y no solo los subtotales.
 *
 * ## Sobre la cuota de un mes, no sobre el compromiso
 *
 * La base es la cuota mensual de esas líneas, no la cuota por los meses
 * contratados. 24 meses de SEO descuentan el 10 % de 250,00 €, no el 10 % de
 * 6.000,00 €. Es coherente con todo el presupuesto: `monthlyCents` es lo que se
 * paga cada mes desde la Fase 3, y el descuento tiene que salir en el mismo
 * bloque y en la misma unidad que la cuota que rebaja. Ver
 * [ADR 0011](../../../docs/adr/0011-sin-compromiso-total.md).
 *
 * **Un solo descuento**, aunque haya varias líneas con permanencia: el motivo
 * es el mismo para todas y dos filas iguales en el resumen con importes
 * distintos no explican nada. Y así hay un único redondeo sobre la base
 * completa, por el mismo motivo que el IGIC (ADR 0007).
 */
export const commitmentDiscount: DiscountStrategy = ({ lines }) => {
  let baseCents = 0

  for (const line of lines) {
    if (qualifiesForCommitmentDiscount(line)) {
      baseCents += calculateLineAmountCents(line)
    }
  }

  const amountCents = calculatePercentCents(
    baseCents,
    COMMITMENT_DISCOUNT_PERCENT,
  )

  if (amountCents <= 0) {
    return []
  }

  return [{ id: 'commitment', label: MOTIVO, block: 'monthly', amountCents }]
}
