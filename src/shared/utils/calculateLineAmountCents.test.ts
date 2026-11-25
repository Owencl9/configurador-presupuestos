import { describe, expect, it } from 'vitest'

import type { BudgetLine } from '../../shared/types/budget'
import type {
  MonthlyService,
  OneTimeService,
  YearlyService,
} from '../../shared/types/service'
import { calculateLineAmountCents } from './calculateLineAmountCents'

const WEB: OneTimeService = {
  id: 'web',
  name: 'Web de ejemplo',
  description: 'Solo para los tests.',
  category: 'web-design',
  priceCents: 120_000, // 1.200,00 €
  payment: 'one-time',
}

const SEO: MonthlyService = {
  id: 'seo',
  name: 'SEO de ejemplo',
  description: 'Solo para los tests.',
  category: 'marketing',
  priceCents: 25_000, // 250,00 €/mes
  payment: 'monthly',
  minMonths: 6,
}

const HOSTING: YearlyService = {
  id: 'hosting',
  name: 'Hosting de ejemplo',
  description: 'Solo para los tests.',
  category: 'infrastructure',
  priceCents: 12_000, // 120,00 €/año
  payment: 'yearly',
}

describe('calculateLineAmountCents', () => {
  it('multiplica el precio del servicio por la cantidad contratada', () => {
    const linea: BudgetLine = { service: WEB, quantity: 3 }

    expect(calculateLineAmountCents(linea)).toBe(360_000) // 3 × 1.200,00 €
  })

  it('con una unidad devuelve el precio del servicio', () => {
    const linea: BudgetLine = { service: WEB, quantity: 1 }

    expect(calculateLineAmountCents(linea)).toBe(WEB.priceCents)
  })

  it('en una línea mensual devuelve la cuota de un mes, no la de la permanencia', () => {
    /*
     * El test más importante de este archivo. La línea lleva 24 meses y el
     * resultado sigue siendo la cuota de **un** mes por la cantidad: los meses
     * están al alcance de la función y no se usan.
     *
     * Multiplicar aquí por los meses sería el error más natural del mundo —y el
     * más difícil de ver, porque el importe seguiría pareciendo razonable—,
     * además de romper el significado de `monthlyCents` que fijó la Fase 3.
     */
    const linea: BudgetLine = { service: SEO, quantity: 2, months: 24 }

    expect(calculateLineAmountCents(linea)).toBe(50_000) // 2 × 250,00 €
  })

  it('usa la misma multiplicación en las tres formas de pago', () => {
    // El importe de una línea es siempre precio × cantidad. Lo que cambia entre
    // las tres formas de pago es *en qué subtotal* cae, y eso lo decide
    // `calculateSubtotals`, no esta función.
    expect(calculateLineAmountCents({ service: WEB, quantity: 2 })).toBe(
      240_000,
    )
    expect(
      calculateLineAmountCents({ service: SEO, quantity: 2, months: 6 }),
    ).toBe(50_000)
    expect(calculateLineAmountCents({ service: HOSTING, quantity: 2 })).toBe(
      24_000,
    )
  })

  it('devuelve un número entero de céntimos', () => {
    // Dos enteros multiplicados dan un entero, así que esto no puede fallar por
    // aritmética. Lo que vigila es que a nadie se le ocurra meter aquí un
    // porcentaje o una división, que es por donde el dinero se iría a coma
    // flotante (ADR 0003).
    expect(
      Number.isInteger(
        calculateLineAmountCents({ service: SEO, quantity: 7, months: 6 }),
      ),
    ).toBe(true)
  })

  it('no modifica la línea que recibe', () => {
    const linea: BudgetLine = { service: SEO, quantity: 2, months: 12 }
    const copia = structuredClone(linea)

    calculateLineAmountCents(linea)

    expect(linea).toEqual(copia)
  })
})
