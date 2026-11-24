import { describe, expect, it } from 'vitest'

import type { BudgetLine } from '../../shared/types/budget'
import type {
  MonthlyService,
  OneTimeService,
  YearlyService,
} from '../../shared/types/service'
import { calculateSubtotals } from './calculateSubtotals'

/*
 * Servicios inventados, no el catálogo real. Mismo criterio que en la Fase 2
 * con `groupServicesByCategory`: lo que se prueba aquí es el reparto por forma
 * de pago, así que cambiar una tarifa del catálogo no debe romper estos tests.
 * Los importes son redondos para que las sumas se puedan comprobar de cabeza.
 */
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

/**
 * Atajo para escribir una línea de presupuesto en los tests.
 *
 * Desde la Fase 4 una línea mensual **tiene que llevar meses**, así que el
 * atajo los pone: los mínimos del servicio, igual que `createBudgetLine`. No
 * llama a `createBudgetLine` a propósito, para que estos tests sigan probando
 * solo `calculateSubtotals` y no dos funciones a la vez.
 *
 * Las nueve comprobaciones de abajo no han cambiado ni una línea al crecer el
 * tipo: describen el reparto por forma de pago, que es lo que esta función
 * hace, y no la forma exacta de una línea.
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

describe('calculateSubtotals', () => {
  it('devuelve tres ceros con un presupuesto vacío', () => {
    expect(calculateSubtotals([])).toEqual({
      oneTimeCents: 0,
      monthlyCents: 0,
      yearlyCents: 0,
    })
  })

  it('suma un servicio de pago único en el pago inicial y deja los demás a cero', () => {
    expect(calculateSubtotals([linea(WEB)])).toEqual({
      oneTimeCents: 120_000,
      monthlyCents: 0,
      yearlyCents: 0,
    })
  })

  it('suma un servicio mensual en la cuota mensual y deja los demás a cero', () => {
    expect(calculateSubtotals([linea(SEO)])).toEqual({
      oneTimeCents: 0,
      monthlyCents: 25_000,
      yearlyCents: 0,
    })
  })

  it('suma un servicio anual en el pago anual y deja los demás a cero', () => {
    // El error más fácil de esta función es tratar el anual como mensual, o al
    // revés. Las tres formas de pago tienen su test de aislamiento.
    expect(calculateSubtotals([linea(HOSTING)])).toEqual({
      oneTimeCents: 0,
      monthlyCents: 0,
      yearlyCents: 12_000,
    })
  })

  it('multiplica el precio por la cantidad contratada', () => {
    expect(calculateSubtotals([linea(WEB, 3)]).oneTimeCents).toBe(360_000)
  })

  it('suma varios servicios de la misma forma de pago', () => {
    const otroMensual: MonthlyService = {
      ...SEO,
      id: 'redes',
      priceCents: 30_000,
    }

    expect(
      calculateSubtotals([linea(SEO), linea(otroMensual)]).monthlyCents,
    ).toBe(
      55_000, // 250,00 € + 300,00 €
    )
  })

  it('mantiene separadas las tres formas de pago en un presupuesto mixto', () => {
    // El caso que de verdad importa: 1.200 € iniciales, 250 €/mes y 120 €/año.
    // Tres importes que no se suman entre ellos, porque se pagan en momentos
    // distintos (apartado 4.4 del prompt maestro).
    expect(
      calculateSubtotals([linea(WEB), linea(SEO), linea(HOSTING)]),
    ).toEqual({
      oneTimeCents: 120_000,
      monthlyCents: 25_000,
      yearlyCents: 12_000,
    })
  })

  it('devuelve la cuota de un mes, no el total de la permanencia', () => {
    // `monthlyCents` es lo que se paga cada mes. Multiplicarlo por los meses
    // contratados es otra cosa y no es asunto de esta función.
    //
    // Desde la Fase 4 este test vale más que cuando se escribió: los meses ya
    // están en la línea —el atajo de arriba le pone los 6 del servicio— y el
    // resultado sigue siendo la cuota de **un** mes. Antes comprobaba que no se
    // multiplicaba por un dato que no existía; ahora comprueba que no se
    // multiplica por uno que sí está ahí, al alcance de la función.
    expect(calculateSubtotals([linea(SEO)]).monthlyCents).toBe(SEO.priceCents)
  })

  it('no modifica la lista de líneas que recibe', () => {
    const lineas: BudgetLine[] = [linea(WEB), linea(SEO)]
    const copia = structuredClone(lineas)

    calculateSubtotals(lineas)

    expect(lineas).toEqual(copia)
  })
})
