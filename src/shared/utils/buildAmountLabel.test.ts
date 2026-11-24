import { describe, expect, it } from 'vitest'

import { buildAmountLabel } from './buildAmountLabel'

describe('buildAmountLabel', () => {
  it('no añade sufijo a un importe de pago único', () => {
    expect(buildAmountLabel(120_000, 'one-time')).toBe('1.200,00 €')
  })

  it('añade «/mes» a un importe mensual', () => {
    expect(buildAmountLabel(25_000, 'monthly')).toBe('250,00 €/mes')
  })

  it('añade «/año» a un importe anual', () => {
    expect(buildAmountLabel(12_000, 'yearly')).toBe('120,00 €/año')
  })

  it('formatea el importe con el separador de millares', () => {
    // El formato lo pone `formatEuros`, que ya tiene sus 13 tests. Aquí solo se
    // comprueba que esta función lo usa y no formatea por su cuenta.
    expect(buildAmountLabel(250_000, 'one-time')).toBe('2.500,00 €')
  })

  it('mantiene el sufijo en un importe negativo', () => {
    // Los descuentos se muestran en negativo (Fase 6), y un descuento sobre la
    // cuota mensual sigue siendo mensual.
    expect(buildAmountLabel(-6_250, 'monthly')).toBe('-62,50 €/mes')
  })

  it('devuelve el importe de cero con su sufijo', () => {
    expect(buildAmountLabel(0, 'yearly')).toBe('0,00 €/año')
  })
})
