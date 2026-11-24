import { describe, expect, it } from 'vitest'

import type {
  MonthlyService,
  OneTimeService,
  YearlyService,
} from '../../shared/types/service'
import { buildPriceLabel } from './buildPriceLabel'

/*
 * Servicios de prueba. No se usa el catálogo real a propósito: si estos tests
 * dependieran de los precios de `services.ts`, cambiar una tarifa rompería
 * tests que no hablan de tarifas. Lo que se prueba aquí es el formato.
 */
const PAGO_UNICO: OneTimeService = {
  id: 'ejemplo-unico',
  name: 'Servicio de ejemplo',
  description: 'Solo para los tests.',
  category: 'web-design',
  priceCents: 120_000,
  payment: 'one-time',
}

const MENSUAL: MonthlyService = {
  id: 'ejemplo-mensual',
  name: 'Servicio de ejemplo',
  description: 'Solo para los tests.',
  category: 'marketing',
  priceCents: 25_000,
  payment: 'monthly',
  minMonths: 6,
}

const ANUAL: YearlyService = {
  id: 'ejemplo-anual',
  name: 'Servicio de ejemplo',
  description: 'Solo para los tests.',
  category: 'infrastructure',
  priceCents: 12_000,
  payment: 'yearly',
}

describe('buildPriceLabel', () => {
  it('muestra un pago único sin sufijo, en formato español', () => {
    expect(buildPriceLabel(PAGO_UNICO)).toBe('1.200,00 €')
  })

  it('añade «/mes» a un servicio mensual', () => {
    expect(buildPriceLabel(MENSUAL)).toBe('250,00 €/mes')
  })

  it('añade «/año» a un servicio anual', () => {
    expect(buildPriceLabel(ANUAL)).toBe('120,00 €/año')
  })

  it('escribe siempre los dos decimales, aunque sean cero', () => {
    expect(buildPriceLabel({ ...ANUAL, priceCents: 7_200 })).toBe('72,00 €/año')
  })

  it('separa los millares con punto y los decimales con coma', () => {
    // Formato español (apartado 4.3 del prompt maestro): el punto agrupa
    // millares y la coma separa los decimales, al contrario que en inglés.
    expect(buildPriceLabel({ ...PAGO_UNICO, priceCents: 1_234_567 })).toBe(
      '12.345,67 €',
    )
  })

  it('no pierde los céntimos que no acaban en cero', () => {
    expect(buildPriceLabel({ ...PAGO_UNICO, priceCents: 199_999 })).toBe(
      '1.999,99 €',
    )
  })

  it('rellena con un cero los céntimos de una sola cifra', () => {
    // 1.205 céntimos son 12,05 €, no 12,5 €. Es el error de redondeo más
    // fácil de cometer al convertir céntimos a euros a mano.
    expect(buildPriceLabel({ ...PAGO_UNICO, priceCents: 1_205 })).toBe(
      '12,05 €',
    )
  })

  it('muestra un importe menor de un euro con el cero delante', () => {
    expect(buildPriceLabel({ ...PAGO_UNICO, priceCents: 50 })).toBe('0,50 €')
  })
})
