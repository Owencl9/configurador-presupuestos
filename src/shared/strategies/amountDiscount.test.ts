import { describe, expect, it } from 'vitest'

import {
  AMOUNT_DISCOUNT_PERCENT,
  AMOUNT_DISCOUNT_THRESHOLD_CENTS,
} from '../constants/business-rules'
import { amountDiscount } from './amountDiscount'
import type { DiscountContext } from './discountStrategy'

/**
 * Esta estrategia **solo mira los subtotales**: ni cuenta servicios ni
 * necesita las líneas. Por eso los tests pueden pasar la lista vacía y seguir
 * describiendo la regla con exactitud.
 */
function contexto(
  subtotales: Partial<DiscountContext['subtotalsCents']>,
): DiscountContext {
  return {
    lines: [],
    subtotalsCents: { oneTime: 0, monthly: 0, yearly: 0, ...subtotales },
  }
}

describe('amountDiscount', () => {
  it('no descuenta nada por debajo del umbral', () => {
    const descuentos = amountDiscount(
      contexto({ oneTime: AMOUNT_DISCOUNT_THRESHOLD_CENTS - 1 }),
    )

    expect(descuentos).toEqual([])
  })

  it('no descuenta nada con el umbral exacto', () => {
    /*
     * **La comparación es estrictamente mayor**, y este es el test que lo fija:
     * el apartado 4.3 dice «si el pago único **supera** 3.000 €», y 3.000,00 €
     * exactos no superan 3.000 €. Un céntimo más, sí.
     *
     * No es una sutileza de redacción: con `>=` un presupuesto de 3.000,00 €
     * llevaría 150,00 € de descuento, y la diferencia entre los dos casos sería
     * de un céntimo de subtotal y 150 € de factura.
     */
    const descuentos = amountDiscount(
      contexto({ oneTime: AMOUNT_DISCOUNT_THRESHOLD_CENTS }),
    )

    expect(descuentos).toEqual([])
  })

  it('descuenta con un céntimo por encima del umbral', () => {
    const descuentos = amountDiscount(
      contexto({ oneTime: AMOUNT_DISCOUNT_THRESHOLD_CENTS + 1 }),
    )

    expect(descuentos).toHaveLength(1)
    expect(descuentos[0]?.block).toBe('oneTime')
  })

  it('descuenta el porcentaje del subtotal del pago inicial', () => {
    /*
     * El tercer ejemplo del usuario: tienda online (2.500,00 €) y web
     * corporativa (1.200,00 €) son 3.700,00 €, que superan el umbral. El 5 %
     * son 185,00 €.
     *
     * Son dos servicios distintos, así que **no hay pack**: este presupuesto
     * lleva solo este descuento. Comprobado de punta a punta en
     * `calculateBudget.test.ts`.
     */
    const descuentos = amountDiscount(contexto({ oneTime: 370_000 }))

    expect(descuentos[0]?.amountCents).toBe(18_500)
  })

  it('no mira el subtotal de la cuota mensual ni el del pago anual', () => {
    /*
     * La regla es del pago inicial y de ningún otro bloque. Una cuota mensual
     * de 5.000,00 € —que sería un presupuesto enorme— no activa este
     * descuento: el apartado 4.3 habla del pago único, y mezclar los bloques
     * aquí haría que una cuota recurrente rebajara un pago que no tiene nada
     * que ver con ella.
     */
    const descuentos = amountDiscount(
      contexto({ monthly: 500_000, yearly: 500_000 }),
    )

    expect(descuentos).toEqual([])
  })

  it('redondea el descuento al céntimo', () => {
    // 5 % de 3.000,01 € son 150,0005 €: 15.000 céntimos.
    const descuentos = amountDiscount(contexto({ oneTime: 300_001 }))

    expect(descuentos[0]?.amountCents).toBe(15_000)
  })

  it('explica el motivo con el umbral y el porcentaje de las constantes', () => {
    // El umbral aparece en euros, formateado a la española: «3.000,00 €».
    const descuentos = amountDiscount(contexto({ oneTime: 400_000 }))

    expect(descuentos[0]?.id).toBe('amount')
    expect(descuentos[0]?.label).toContain('3.000,00 €')
    expect(descuentos[0]?.label).toContain(`${AMOUNT_DISCOUNT_PERCENT} %`)
  })
})
