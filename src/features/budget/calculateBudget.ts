import { IGIC_RATE_PERCENT } from '../../shared/constants/business-rules'
import type {
  Budget,
  BudgetLine,
  PaymentBlock,
} from '../../shared/types/budget'
import { calculateIgic } from './calculateIgic'
import { calculateSubtotals } from './calculateSubtotals'

/**
 * Aplica a un subtotal el orden de cálculo del apartado 4.3:
 * `subtotal → descuentos → base imponible → IGIC → total`.
 *
 * El orden importa y no es intercambiable: el IGIC se calcula **después** de
 * los descuentos, sobre la base ya rebajada. Calcularlo antes daría un impuesto
 * sobre dinero que el cliente no paga.
 *
 * `discountCents` vale 0 en toda la Fase 3. Es el hueco donde la Fase 6
 * escribirá el resultado de las estrategias de descuento
 * ([ADR 0004](../../../docs/adr/0004-strategy-para-descuentos.md)), y está
 * declarado desde ahora para que añadirlos no cambie la forma del presupuesto
 * ni los componentes que ya lo muestren.
 */
function buildPaymentBlock(
  subtotalCents: number,
  igicRatePercent: number,
): PaymentBlock {
  const discountCents = 0
  const taxableBaseCents = subtotalCents - discountCents
  const igicCents = calculateIgic(taxableBaseCents, igicRatePercent)

  return {
    subtotalCents,
    discountCents,
    taxableBaseCents,
    igicCents,
    totalCents: taxableBaseCents + igicCents,
  }
}

/**
 * Calcula el presupuesto completo a partir de las líneas seleccionadas.
 *
 * Es la **única puerta de entrada** al cálculo: los componentes llaman aquí con
 * las líneas y reciben los tres bloques listos para mostrar, sin hacer ninguna
 * cuenta por su parte. Función pura: mismas líneas, mismo resultado.
 *
 * Devuelve **tres bloques independientes** y ningún total general. No es un
 * olvido: sumar un pago único, una cuota mensual y una cuota anual produce un
 * importe que el cliente no paga en ningún momento. Lo que se paga el primer
 * día —el pago inicial más la primera cuota— es una decisión de presentación y
 * le corresponde al resumen de la Fase 4. Ver
 * [ADR 0007](../../../docs/adr/0007-redondeo-del-igic.md).
 *
 * @param lines Servicios seleccionados con su cantidad.
 * @param igicRatePercent Tipo de IGIC en porcentaje. Por defecto, el
 *   configurado en `shared/constants/business-rules.ts`. **Este valor por
 *   defecto es el único punto del código que lee la configuración del
 *   impuesto**; se puede indicar otro, y de hecho los tests lo hacen para no
 *   depender de la configuración del proyecto.
 */
export function calculateBudget(
  lines: readonly BudgetLine[],
  igicRatePercent: number = IGIC_RATE_PERCENT,
): Budget {
  const { oneTimeCents, monthlyCents, yearlyCents } = calculateSubtotals(lines)

  /*
   * Un redondeo del IGIC por bloque, y ninguno más. `buildPaymentBlock` llama a
   * `calculateIgic` una sola vez con la base completa del bloque, nunca con el
   * importe de una línea: la suma de redondeos no es el redondeo de la suma.
   */
  return {
    oneTime: buildPaymentBlock(oneTimeCents, igicRatePercent),
    monthly: buildPaymentBlock(monthlyCents, igicRatePercent),
    yearly: buildPaymentBlock(yearlyCents, igicRatePercent),
  }
}
