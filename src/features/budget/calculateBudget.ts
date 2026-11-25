import { IGIC_RATE_PERCENT } from '../../shared/constants/business-rules'
import {
  calculateDiscounts,
  DISCOUNT_STRATEGIES,
  sumDiscountCents,
} from '../../shared/strategies/calculateDiscounts'
import type { DiscountStrategy } from '../../shared/strategies/discountStrategy'
import type {
  AppliedDiscount,
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
 * **El descuento no se calcula aquí, y tampoco se suma aquí.** Llega ya
 * decidido, como la lista de descuentos del bloque con su motivo, y el importe
 * es la suma de esa lista: `sumDiscountCents` es la única forma de obtenerlo.
 * Es lo que garantiza que el desglose de pantalla cuadre siempre con el
 * importe restado, en lugar de ser dos cálculos que podrían discrepar.
 */
function buildPaymentBlock(
  subtotalCents: number,
  discounts: readonly AppliedDiscount[],
  igicRatePercent: number,
): PaymentBlock {
  const discountCents = sumDiscountCents(discounts)
  const taxableBaseCents = subtotalCents - discountCents
  const igicCents = calculateIgic(taxableBaseCents, igicRatePercent)

  return {
    subtotalCents,
    discountCents,
    discounts,
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
 * ## El orden de cálculo completo, desde la Fase 6
 *
 * 1. `calculateSubtotals` reparte las líneas en los tres subtotales.
 * 2. `calculateDiscounts` ejecuta las estrategias **sobre esos subtotales sin
 *    descontar** y devuelve, por bloque, los descuentos con su motivo y el tope
 *    del 20 % ya aplicado.
 * 3. Cada bloque resta su descuento, calcula su IGIC sobre la base rebajada y
 *    suma su total.
 *
 * Los descuentos **se calculan siempre y no se guardan en ninguna parte**. No
 * entran en el borrador de `localStorage`, que sigue guardando solo
 * identificador, cantidad y meses
 * ([ADR 0009](../../../docs/adr/0009-borradores-en-localstorage.md)): un
 * descuento guardado sería un importe que alguien podría editar desde el
 * navegador, y además caducaría en cuanto cambiara una regla.
 *
 * @param lines Servicios seleccionados con su cantidad.
 * @param igicRatePercent Tipo de IGIC en porcentaje. Por defecto, el
 *   configurado en `shared/constants/business-rules.ts`. **Este valor por
 *   defecto es el único punto del código que lee la configuración del
 *   impuesto**; se puede indicar otro, y de hecho los tests lo hacen para no
 *   depender de la configuración del proyecto.
 * @param strategies Las estrategias de descuento. Por defecto, las tres del
 *   proyecto. Se indica otra lista por el mismo motivo que el tipo de IGIC:
 *   para poder probar el tope del 20 % —que las reglas reales no alcanzan— sin
 *   cambiar ninguna regla real.
 */
export function calculateBudget(
  lines: readonly BudgetLine[],
  igicRatePercent: number = IGIC_RATE_PERCENT,
  strategies: readonly DiscountStrategy[] = DISCOUNT_STRATEGIES,
): Budget {
  const subtotals = calculateSubtotals(lines)
  const { oneTimeCents, monthlyCents, yearlyCents } = subtotals

  /*
   * Los descuentos se deciden con los subtotales **antes** de descontar nada.
   * Es lo que impide que una regla dependa del resultado de otra, y por tanto
   * del orden en que se ejecuten
   * ([ADR 0010](../../../docs/adr/0010-como-se-aplican-los-descuentos.md)).
   */
  const discounts = calculateDiscounts(lines, subtotals, strategies)

  /*
   * Un redondeo del IGIC por bloque, y ninguno más. `buildPaymentBlock` llama a
   * `calculateIgic` una sola vez con la base completa del bloque, nunca con el
   * importe de una línea: la suma de redondeos no es el redondeo de la suma.
   */
  return {
    oneTime: buildPaymentBlock(
      oneTimeCents,
      discounts.oneTime,
      igicRatePercent,
    ),
    monthly: buildPaymentBlock(
      monthlyCents,
      discounts.monthly,
      igicRatePercent,
    ),
    yearly: buildPaymentBlock(yearlyCents, discounts.yearly, igicRatePercent),
  }
}
