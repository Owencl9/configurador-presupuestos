import { describe, expect, it } from 'vitest'

import {
  COMMITMENT_DISCOUNT_MIN_MONTHS,
  COMMITMENT_DISCOUNT_PERCENT,
} from '../constants/business-rules'
import type { BudgetLine, MonthlyBudgetLine } from '../types/budget'
import type { MonthlyService } from '../types/service'
import {
  commitmentDiscount,
  qualifiesForCommitmentDiscount,
} from './commitmentDiscount'
import type { DiscountContext } from './discountStrategy'

const SEO_BASICO: MonthlyService = {
  id: 'seo-basico',
  name: 'SEO de ejemplo',
  description: 'Solo para los tests.',
  category: 'marketing',
  priceCents: 25_000, // 250,00 €/mes
  payment: 'monthly',
  minMonths: 6,
}

const MANTENIMIENTO: MonthlyService = {
  id: 'mantenimiento',
  name: 'Mantenimiento de ejemplo',
  description: 'Solo para los tests.',
  category: 'maintenance',
  priceCents: 6_000, // 60,00 €/mes
  payment: 'monthly',
  minMonths: 3,
}

const TIENDA: BudgetLine = {
  quantity: 1,
  service: {
    id: 'tienda',
    name: 'Tienda de ejemplo',
    description: 'Solo para los tests.',
    category: 'web-design',
    priceCents: 250_000,
    payment: 'one-time',
  },
}

const HOSTING: BudgetLine = {
  quantity: 1,
  service: {
    id: 'hosting',
    name: 'Hosting de ejemplo',
    description: 'Solo para los tests.',
    category: 'infrastructure',
    priceCents: 12_000,
    payment: 'yearly',
  },
}

/** Una línea mensual con los meses que diga el test. */
function mensual(
  service: MonthlyService,
  months: number,
  quantity = 1,
): MonthlyBudgetLine {
  return { service, months, quantity }
}

/**
 * Atajo para escribir un contexto.
 *
 * El subtotal mensual se pasa aparte porque la estrategia **no** lo usa como
 * base —su base son solo las líneas que cumplen la permanencia—, y los tests
 * tienen que poder comprobar precisamente eso.
 */
function contexto(
  lines: readonly BudgetLine[],
  subtotales: Partial<DiscountContext['subtotalsCents']> = {},
): DiscountContext {
  return {
    lines,
    subtotalsCents: { oneTime: 0, monthly: 0, yearly: 0, ...subtotales },
  }
}

describe('qualifiesForCommitmentDiscount', () => {
  it('no admite una línea mensual por debajo del mínimo de meses', () => {
    expect(
      qualifiesForCommitmentDiscount(
        mensual(SEO_BASICO, COMMITMENT_DISCOUNT_MIN_MONTHS - 1),
      ),
    ).toBe(false)
  })

  it('admite una línea mensual con los meses justos del mínimo', () => {
    // «12 meses o más»: el 12 entra. Es un límite inclusivo, al contrario que
    // el umbral del descuento por importe, que es estricto.
    expect(
      qualifiesForCommitmentDiscount(
        mensual(SEO_BASICO, COMMITMENT_DISCOUNT_MIN_MONTHS),
      ),
    ).toBe(true)
  })

  it('admite una línea mensual por encima del mínimo', () => {
    expect(
      qualifiesForCommitmentDiscount(
        mensual(SEO_BASICO, COMMITMENT_DISCOUNT_MIN_MONTHS + 1),
      ),
    ).toBe(true)
  })

  it('no admite una línea de pago único ni una anual', () => {
    /*
     * Ni siquiera son candidatas: la permanencia en meses no significa nada en
     * un servicio que se paga una vez o por años. El predicado pasa por
     * `isMonthlyLine`, así que la pregunta por los meses no se llega a hacer.
     */
    expect(qualifiesForCommitmentDiscount(TIENDA)).toBe(false)
    expect(qualifiesForCommitmentDiscount(HOSTING)).toBe(false)
  })
})

describe('commitmentDiscount', () => {
  it('no descuenta nada sin líneas mensuales', () => {
    expect(commitmentDiscount(contexto([TIENDA, HOSTING]))).toEqual([])
  })

  it('no descuenta nada con líneas mensuales por debajo del mínimo', () => {
    const descuentos = commitmentDiscount(
      contexto([mensual(SEO_BASICO, 6)], { monthly: 25_000 }),
    )

    expect(descuentos).toEqual([])
  })

  it('descuenta el porcentaje de la línea que cumple la permanencia', () => {
    // 10 % de 250,00 € = 25,00 €.
    const descuentos = commitmentDiscount(
      contexto([mensual(SEO_BASICO, 12)], { monthly: 25_000 }),
    )

    expect(descuentos).toHaveLength(1)
    expect(descuentos[0]?.block).toBe('monthly')
    expect(descuentos[0]?.amountCents).toBe(2_500)
  })

  it('descuenta solo las líneas que cumplen la permanencia, no todo el bloque', () => {
    /*
     * **El test que distingue esta regla del pack.** Dos servicios mensuales:
     * el SEO a 12 meses (250,00 €) y el mantenimiento a 3 (60,00 €). El
     * subtotal del bloque es 310,00 €, pero la base del descuento son solo los
     * 250,00 € del SEO: 25,00 € y no 31,00 €.
     *
     * Es la diferencia entre «10 % sobre esos servicios» y «10 % sobre el
     * subtotal mensual», y es la razón de que la estrategia reciba las líneas y
     * no solo los subtotales.
     */
    const descuentos = commitmentDiscount(
      contexto([mensual(SEO_BASICO, 12), mensual(MANTENIMIENTO, 3)], {
        monthly: 31_000,
      }),
    )

    expect(descuentos[0]?.amountCents).toBe(2_500)
  })

  it('suma todas las líneas que cumplen la permanencia en un solo descuento', () => {
    /*
     * 250,00 € + 60,00 € = 310,00 € de base, y un único descuento de 31,00 €.
     * Uno y no dos: el motivo es el mismo —la permanencia— y el resumen
     * mostraría dos filas idénticas con importes distintos, que es ruido. Un
     * único redondeo sobre la base completa, además, por el mismo motivo que el
     * IGIC (ADR 0007).
     */
    const descuentos = commitmentDiscount(
      contexto([mensual(SEO_BASICO, 12), mensual(MANTENIMIENTO, 24)], {
        monthly: 31_000,
      }),
    )

    expect(descuentos).toHaveLength(1)
    expect(descuentos[0]?.amountCents).toBe(3_100)
  })

  it('tiene en cuenta las unidades de la línea', () => {
    // Tres planes de SEO a 12 meses: 750,00 € de cuota, 75,00 € de descuento.
    const descuentos = commitmentDiscount(
      contexto([mensual(SEO_BASICO, 12, 3)], { monthly: 75_000 }),
    )

    expect(descuentos[0]?.amountCents).toBe(7_500)
  })

  it('no multiplica la cuota por los meses contratados', () => {
    /*
     * El descuento se calcula sobre **la cuota de un mes**, no sobre el total
     * comprometido. 24 meses de SEO no descuentan 10 % de 6.000,00 €, sino
     * 10 % de 250,00 €. Es la misma decisión que mantiene `monthlyCents` como
     * la cuota de un mes desde la Fase 3, y la que hace que el presupuesto no
     * tenga un total del compromiso
     * ([ADR 0011](../../../docs/adr/0011-sin-compromiso-total.md)).
     */
    const descuentos = commitmentDiscount(
      contexto([mensual(SEO_BASICO, 24)], { monthly: 25_000 }),
    )

    expect(descuentos[0]?.amountCents).toBe(2_500)
  })

  it('redondea el descuento al céntimo', () => {
    // 10 % de 450,01 € son 45,001 €: 4.500 céntimos.
    const descuentos = commitmentDiscount(
      contexto([mensual({ ...SEO_BASICO, priceCents: 45_001 }, 12)], {
        monthly: 45_001,
      }),
    )

    expect(descuentos[0]?.amountCents).toBe(4_500)
  })

  it('explica el motivo con los valores de las constantes', () => {
    const descuentos = commitmentDiscount(
      contexto([mensual(SEO_BASICO, 12)], { monthly: 25_000 }),
    )

    expect(descuentos[0]?.id).toBe('commitment')
    expect(descuentos[0]?.label).toContain(
      String(COMMITMENT_DISCOUNT_MIN_MONTHS),
    )
    expect(descuentos[0]?.label).toContain(`${COMMITMENT_DISCOUNT_PERCENT} %`)
  })
})
