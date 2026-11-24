import { describe, expect, it } from 'vitest'

import { IGIC_RATE_PERCENT } from '../../shared/constants/business-rules'
import type { BudgetLine } from '../../shared/types/budget'
import type {
  MonthlyService,
  OneTimeService,
  YearlyService,
} from '../../shared/types/service'
import { calculateBudget } from './calculateBudget'

const TIENDA: OneTimeService = {
  id: 'tienda',
  name: 'Tienda de ejemplo',
  description: 'Solo para los tests.',
  category: 'web-design',
  priceCents: 250_000, // 2.500,00 €
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

/**
 * Atajo para escribir una línea de presupuesto en los tests. Desde la Fase 4
 * una línea mensual lleva meses obligatoriamente; se ponen los mínimos del
 * servicio. Ninguna de las nueve comprobaciones de este archivo cambió al
 * crecer el tipo.
 */
function linea(service: BudgetLine['service'], quantity = 1): BudgetLine {
  switch (service.payment) {
    case 'monthly':
      return { service, quantity, months: service.minMonths }
    case 'one-time':
      return { service, quantity }
    case 'yearly':
      return { service, quantity }
  }
}

/*
 * El tipo de IGIC se pasa explícito (7) en los tests que comprueban importes,
 * para que cambiar la configuración del proyecto no rompa tests que no hablan
 * de configuración. Hay un test aparte que comprueba que el valor por defecto
 * es el configurado.
 */
describe('calculateBudget', () => {
  it('devuelve los tres bloques a cero con un presupuesto vacío', () => {
    const presupuesto = calculateBudget([], 7)

    for (const bloque of [
      presupuesto.oneTime,
      presupuesto.monthly,
      presupuesto.yearly,
    ]) {
      expect(bloque).toEqual({
        subtotalCents: 0,
        discountCents: 0,
        taxableBaseCents: 0,
        igicCents: 0,
        totalCents: 0,
      })
    }
  })

  it('sigue el orden de cálculo del apartado 4.3 en un bloque', () => {
    // subtotal → descuentos → base imponible → IGIC → total.
    // 1.200,00 € + 7 % = 1.284,00 €.
    const presupuesto = calculateBudget(
      [linea({ ...TIENDA, priceCents: 120_000 })],
      7,
    )

    expect(presupuesto.oneTime).toEqual({
      subtotalCents: 120_000,
      discountCents: 0,
      taxableBaseCents: 120_000,
      igicCents: 8_400,
      totalCents: 128_400,
    })
  })

  it('calcula los tres bloques de un presupuesto mixto', () => {
    /*
     * El ejemplo completo: 2.500 € de tienda, 250 €/mes de SEO y 120 €/año de
     * hosting. Tres pagos en tres momentos distintos, cada uno con su IGIC y su
     * total. Comprobado a mano:
     *
     *   Pago inicial   2.500,00 € + 175,00 € = 2.675,00 €
     *   Cuota mensual    250,00 € +  17,50 € =   267,50 € /mes
     *   Pago anual       120,00 € +   8,40 € =   128,40 € /año
     */
    const presupuesto = calculateBudget(
      [linea(TIENDA), linea(SEO), linea(HOSTING)],
      7,
    )

    expect(presupuesto.oneTime.igicCents).toBe(17_500)
    expect(presupuesto.oneTime.totalCents).toBe(267_500)
    expect(presupuesto.monthly.igicCents).toBe(1_750)
    expect(presupuesto.monthly.totalCents).toBe(26_750)
    expect(presupuesto.yearly.igicCents).toBe(840)
    expect(presupuesto.yearly.totalCents).toBe(12_840)
  })

  it('aplica a cada bloque el IGIC de su propia base, no el de la suma', () => {
    // Si el cálculo mezclara los tres bloques, el IGIC de la cuota mensual
    // saldría de 2.870 € en lugar de 250 €, y la cuota mensual del cliente
    // incluiría el impuesto de la tienda que paga una sola vez.
    const presupuesto = calculateBudget(
      [linea(TIENDA), linea(SEO), linea(HOSTING)],
      7,
    )

    expect(presupuesto.monthly.igicCents).toBe(
      Math.round((SEO.priceCents * 7) / 100),
    )
  })

  it('aplica el IGIC una sola vez sobre la base, no línea a línea', () => {
    /*
     * Siete líneas de 0,07 €. El 7 % de cada línea redondeado es 0, así que
     * sumar los redondeos daría 0 céntimos de IGIC. El 7 % de la base completa
     * (0,49 €) son 3 céntimos. La suma de redondeos no es el redondeo de la
     * suma, y este test fija cuál de las dos cosas hace la aplicación.
     */
    const céntimoSuelto: OneTimeService = { ...TIENDA, priceCents: 7 }
    const presupuesto = calculateBudget(
      Array.from({ length: 7 }, (_, i) =>
        linea({ ...céntimoSuelto, id: `c${i}` }),
      ),
      7,
    )

    expect(presupuesto.oneTime.subtotalCents).toBe(49)
    expect(presupuesto.oneTime.igicCents).toBe(3)
  })

  it('no aplica ningún descuento todavía', () => {
    // Los descuentos son la Fase 6. Hasta entonces el hueco vale 0 y la base
    // imponible coincide con el subtotal.
    const presupuesto = calculateBudget([linea(TIENDA), linea(SEO)], 7)

    expect(presupuesto.oneTime.discountCents).toBe(0)
    expect(presupuesto.oneTime.taxableBaseCents).toBe(
      presupuesto.oneTime.subtotalCents,
    )
  })

  it('mantiene las dos igualdades del desglose en los tres bloques', () => {
    /*
     * Las invariantes del presupuesto, comprobadas como tales y no sobre un
     * importe concreto: la base es el subtotal menos el descuento, y el total
     * es la base más el IGIC. Cuando la Fase 6 escriba un descuento distinto de
     * cero, este test seguirá describiendo lo que tiene que cumplirse.
     */
    const presupuesto = calculateBudget(
      [linea(TIENDA, 2), linea(SEO, 3), linea(HOSTING)],
      7,
    )

    for (const [nombre, bloque] of Object.entries(presupuesto)) {
      expect(bloque.taxableBaseCents, nombre).toBe(
        bloque.subtotalCents - bloque.discountCents,
      )
      expect(bloque.totalCents, nombre).toBe(
        bloque.taxableBaseCents + bloque.igicCents,
      )
    }
  })

  it('usa el tipo de IGIC configurado cuando no se le indica otro', () => {
    // La configurabilidad que pide el apartado 4.3: el valor real entra en el
    // cálculo por un único sitio, el archivo de constantes.
    const presupuesto = calculateBudget([linea(TIENDA)])

    expect(presupuesto.oneTime.igicCents).toBe(
      Math.round((TIENDA.priceCents * IGIC_RATE_PERCENT) / 100),
    )
  })

  it('admite un tipo de IGIC distinto del configurado', () => {
    const exento = calculateBudget([linea(TIENDA)], 0)

    expect(exento.oneTime.igicCents).toBe(0)
    expect(exento.oneTime.totalCents).toBe(250_000)
  })
})
