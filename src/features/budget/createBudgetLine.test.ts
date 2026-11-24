import { describe, expect, it } from 'vitest'

import type {
  MonthlyService,
  OneTimeService,
  YearlyService,
} from '../../shared/types/service'
import { createBudgetLine } from './createBudgetLine'

/*
 * Servicios inventados, no el catálogo real, con el mismo criterio que el resto
 * de los tests de esta carpeta: lo que se prueba es la forma de la línea que se
 * crea, así que cambiar una tarifa del catálogo no debe romper nada de aquí.
 *
 * Los dos servicios mensuales tienen mínimos **distintos** (6 y 3) a propósito:
 * es la única forma de distinguir «pone los meses mínimos del servicio» de
 * «pone un 6 escrito a mano».
 */
const WEB: OneTimeService = {
  id: 'web',
  name: 'Web de ejemplo',
  description: 'Solo para los tests.',
  category: 'web-design',
  priceCents: 120_000,
  payment: 'one-time',
}

const SEO: MonthlyService = {
  id: 'seo',
  name: 'SEO de ejemplo',
  description: 'Solo para los tests.',
  category: 'marketing',
  priceCents: 25_000,
  payment: 'monthly',
  minMonths: 6,
}

const REDES: MonthlyService = {
  id: 'redes',
  name: 'Redes de ejemplo',
  description: 'Solo para los tests.',
  category: 'marketing',
  priceCents: 30_000,
  payment: 'monthly',
  minMonths: 3,
}

const HOSTING: YearlyService = {
  id: 'hosting',
  name: 'Hosting de ejemplo',
  description: 'Solo para los tests.',
  category: 'infrastructure',
  priceCents: 12_000,
  payment: 'yearly',
}

describe('createBudgetLine', () => {
  it('crea la línea de un servicio de pago único con una unidad', () => {
    expect(createBudgetLine(WEB)).toEqual({ service: WEB, quantity: 1 })
  })

  it('crea la línea de un servicio anual con una unidad', () => {
    expect(createBudgetLine(HOSTING)).toEqual({
      service: HOSTING,
      quantity: 1,
    })
  })

  it('crea la línea de un servicio mensual con sus meses mínimos', () => {
    // Añadir un servicio mensual con menos meses de los que admite sería una
    // línea inválida desde el primer instante. El valor inicial es el mínimo,
    // que es el único valor que siempre es correcto.
    expect(createBudgetLine(SEO)).toEqual({
      service: SEO,
      quantity: 1,
      months: 6,
    })
  })

  it('usa el mínimo de cada servicio mensual, no un valor fijo', () => {
    expect(createBudgetLine(REDES)).toEqual({
      service: REDES,
      quantity: 1,
      months: 3,
    })
  })

  it('no pone meses en una línea que no es mensual', () => {
    // `toEqual` falla si el objeto trae un `months` con valor, así que este
    // test detecta la implementación perezosa de poner meses siempre.
    expect(createBudgetLine(WEB)).not.toHaveProperty('months', 6)
    expect(Object.keys(createBudgetLine(HOSTING))).toEqual([
      'service',
      'quantity',
    ])
  })

  it('guarda el servicio recibido, sin copiarlo', () => {
    // La línea apunta al servicio del catálogo. Copiarlo duplicaría los datos
    // y dejaría dos versiones del mismo servicio que podrían no coincidir.
    expect(createBudgetLine(SEO).service).toBe(SEO)
  })

  it('no modifica el servicio que recibe', () => {
    const copia = structuredClone(SEO)

    createBudgetLine(SEO)

    expect(SEO).toEqual(copia)
  })
})
