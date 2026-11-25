import { describe, expect, it } from 'vitest'

import {
  PACK_DISCOUNT_MIN_SERVICES,
  PACK_DISCOUNT_PERCENT,
} from '../constants/business-rules'
import type { BudgetLine } from '../types/budget'
import type { DiscountContext } from './discountStrategy'
import { countDistinctServices, packDiscount } from './packDiscount'

/*
 * Servicios inventados, igual que en los tests de cálculo de la Fase 3. La
 * estrategia no conoce el catálogo: recibe líneas y subtotales, así que los
 * tests pueden usar los importes que mejor describan cada regla.
 */
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

const SEO: BudgetLine = {
  quantity: 1,
  months: 6,
  service: {
    id: 'seo',
    name: 'SEO de ejemplo',
    description: 'Solo para los tests.',
    category: 'marketing',
    priceCents: 25_000,
    payment: 'monthly',
    minMonths: 6,
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

/** Atajo para escribir un contexto en los tests. */
function contexto(
  lines: readonly BudgetLine[],
  subtotales: Partial<DiscountContext['subtotalsCents']> = {},
): DiscountContext {
  return {
    lines,
    subtotalsCents: {
      oneTime: 0,
      monthly: 0,
      yearly: 0,
      ...subtotales,
    },
  }
}

describe('countDistinctServices', () => {
  it('cuenta cero en un presupuesto vacío', () => {
    expect(countDistinctServices([])).toBe(0)
  })

  it('cuenta servicios distintos, no líneas', () => {
    expect(countDistinctServices([TIENDA, SEO, HOSTING])).toBe(3)
  })

  it('no cuenta dos veces el mismo servicio', () => {
    /*
     * El estado de la aplicación no puede tener dos líneas del mismo servicio
     * —lo impide el reducer de la Fase 5—, pero `calculateBudget` acepta
     * cualquier lista de líneas, así que la regla se cuenta por identificador
     * y no por posición.
     */
    expect(countDistinctServices([TIENDA, TIENDA, TIENDA])).toBe(1)
  })

  it('no cuenta las unidades', () => {
    // La decisión del usuario al abrir la Fase 6: tres unidades de la misma
    // web no son un pack.
    expect(countDistinctServices([{ ...TIENDA, quantity: 3 }])).toBe(1)
  })
})

describe('packDiscount', () => {
  it('no descuenta nada con menos servicios de los que exige la regla', () => {
    // Dos servicios distintos, con el mínimo en tres.
    const descuentos = packDiscount(
      contexto([TIENDA, SEO], { oneTime: 250_000, monthly: 25_000 }),
    )

    expect(descuentos).toEqual([])
  })

  it('no descuenta nada con un presupuesto vacío', () => {
    expect(packDiscount(contexto([]))).toEqual([])
  })

  it('no descuenta nada con varias unidades de un solo servicio', () => {
    /*
     * **El caso que el usuario nombró expresamente:** tres unidades de la misma
     * web no son un pack. El subtotal es alto —7.500,00 €— y aun así no hay
     * descuento por pack, porque la regla cuenta servicios distintos.
     */
    const descuentos = packDiscount(
      contexto([{ ...TIENDA, quantity: 3 }], { oneTime: 750_000 }),
    )

    expect(descuentos).toEqual([])
  })

  it('descuenta el porcentaje del subtotal de cada bloque con tres servicios', () => {
    /*
     * La decisión del pendiente nº 11 de PROGRESO.md: el descuento por pack se
     * aplica a **cada bloque por separado**, porque la regla dice «el
     * subtotal» y hay tres. No existe un total único al que aplicarlo
     * ([ADR 0007](../../../docs/adr/0007-redondeo-del-igic.md)).
     *
     * 5 % de 2.500,00 € = 125,00 €; de 250,00 € = 12,50 €; de 120,00 € = 6,00 €.
     */
    const descuentos = packDiscount(
      contexto([TIENDA, SEO, HOSTING], {
        oneTime: 250_000,
        monthly: 25_000,
        yearly: 12_000,
      }),
    )

    expect(descuentos).toHaveLength(3)
    expect(
      descuentos.map(({ block, amountCents }) => [block, amountCents]),
    ).toEqual([
      ['oneTime', 12_500],
      ['monthly', 1_250],
      ['yearly', 600],
    ])
  })

  it('no devuelve un descuento para un bloque sin importe', () => {
    /*
     * Un presupuesto de tres servicios de pago único no tiene cuota mensual, y
     * un descuento de 0,00 € sobre la cuota mensual sería una fila vacía en el
     * resumen. Una regla que no tiene nada que descontar no devuelve nada.
     */
    const descuentos = packDiscount(
      contexto([TIENDA, SEO, HOSTING], { oneTime: 250_000 }),
    )

    expect(descuentos).toHaveLength(1)
    expect(descuentos[0]?.block).toBe('oneTime')
  })

  it('redondea el descuento al céntimo', () => {
    // 5 % de 450,01 € son 22,5005 €: 2.250 céntimos.
    const descuentos = packDiscount(
      contexto([TIENDA, SEO, HOSTING], { monthly: 45_001 }),
    )

    expect(descuentos[0]?.amountCents).toBe(2_250)
  })

  it('explica el motivo con los valores de las constantes', () => {
    /*
     * El motivo se construye con las constantes, no escrito a mano: si mañana
     * el pack pasa a ser de cuatro servicios al 8 %, el texto de la pantalla
     * cambia solo. Un rótulo a mano seguiría diciendo «3 servicios al 5 %» con
     * la regla ya cambiada, y eso es un presupuesto que miente.
     */
    const descuentos = packDiscount(
      contexto([TIENDA, SEO, HOSTING], { oneTime: 250_000 }),
    )

    expect(descuentos[0]?.id).toBe('pack')
    expect(descuentos[0]?.label).toContain(String(PACK_DISCOUNT_MIN_SERVICES))
    expect(descuentos[0]?.label).toContain(`${PACK_DISCOUNT_PERCENT} %`)
  })
})
