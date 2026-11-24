/**
 * Tipos del presupuesto.
 *
 * Igual que `service.ts`, este archivo solo describe la *forma* de los datos:
 * no tiene valores ni lógica, y desaparece al compilar. Los valores de las
 * reglas de negocio viven en `shared/constants/business-rules.ts` y el cálculo
 * en `features/budget/`.
 */

import type { Service } from './service'

/**
 * Un servicio añadido al presupuesto, con la cantidad contratada.
 *
 * `quantity` es un entero mayor o igual que 1, y significa lo mismo en las tres
 * formas de pago: cuántas unidades del servicio se contratan. Dos landing pages
 * son `quantity: 2`, y la cuota mensual de dos planes de SEO es el doble de uno.
 *
 * **Los meses de contratación no están aquí todavía.** Entran en la Fase 4,
 * junto con el selector que los elige, porque es ahí donde se usan: hacen falta
 * para el descuento por permanencia (Fase 6) y para el total comprometido, y
 * ninguno de los dos existe en la Fase 3. Decisión del usuario al aprobar el
 * plan de la fase: el tipo crece cuando crece su uso, no antes.
 */
export interface BudgetLine {
  readonly service: Service
  /** Unidades contratadas. Entero mayor o igual que 1. */
  readonly quantity: number
}

/**
 * Los tres subtotales del presupuesto, separados por forma de pago
 * (apartado 4.4 del prompt maestro). Siempre en céntimos.
 *
 * Las tres cifras son importes de naturaleza distinta y **no se suman entre
 * ellas**: `oneTimeCents` se paga una vez, `monthlyCents` es la cuota de un mes
 * y `yearlyCents` la de un año.
 */
export interface Subtotals {
  /** Suma de los servicios de pago único: el pago inicial. */
  readonly oneTimeCents: number
  /** Cuota de **un** mes, no el total de la permanencia. */
  readonly monthlyCents: number
  /** Cuota de **un** año. */
  readonly yearlyCents: number
}

/**
 * El cálculo completo de una de las tres formas de pago, en el orden que fija
 * el apartado 4.3: subtotal → descuentos → base imponible → IGIC → total.
 *
 * Los cinco importes se guardan, en lugar de recalcularse al mostrarlos, para
 * que el desglose impreso del presupuesto (Fase 7) enseñe exactamente los
 * números con los que se ha calculado el total.
 */
export interface PaymentBlock {
  /** Suma de los precios por la cantidad, antes de descuentos. */
  readonly subtotalCents: number
  /**
   * Descuento aplicado a este bloque, como importe positivo que se resta.
   *
   * **Vale 0 en toda la Fase 3.** Los descuentos con patrón Strategy son la
   * Fase 6 ([ADR 0004](../../../docs/adr/0004-strategy-para-descuentos.md)) y
   * este es el hueco donde escribirán su resultado.
   */
  readonly discountCents: number
  /** `subtotalCents − discountCents`. Es la base sobre la que se aplica el IGIC. */
  readonly taxableBaseCents: number
  /** IGIC redondeado a céntimos. Un único redondeo por bloque (ADR 0007). */
  readonly igicCents: number
  /** `taxableBaseCents + igicCents`. */
  readonly totalCents: number
}

/**
 * El presupuesto calculado: tres bloques independientes.
 *
 * No hay un «total general», y es deliberado: sumar un pago único, una cuota
 * mensual y una cuota anual daría un importe que el cliente no paga en ningún
 * momento. Ver [ADR 0007](../../../docs/adr/0007-redondeo-del-igic.md).
 */
export interface Budget {
  /** Pago inicial. */
  readonly oneTime: PaymentBlock
  /** Cuota mensual. */
  readonly monthly: PaymentBlock
  /** Pago anual. */
  readonly yearly: PaymentBlock
}
