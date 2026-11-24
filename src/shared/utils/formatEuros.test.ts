import { describe, expect, it } from 'vitest'

import { formatEuros } from './formatEuros'

/*
 * Formato español de importes, según el apartado 4.3 del prompt maestro:
 * el punto agrupa los millares y la coma separa los decimales.
 *
 * La entrada son SIEMPRE céntimos enteros (ADR 0003). Esta función es el único
 * punto del proyecto donde el dinero deja de ser un entero y pasa a ser texto.
 */
describe('formatEuros', () => {
  it('agrupa los millares con punto aunque el importe tenga cuatro cifras', () => {
    // Caso deliberado: `Intl.NumberFormat` en español NO pone el separador aquí
    // —escribiría «1200,00 €», siguiendo la norma de la RAE—, y el formato que
    // fija la especificación sí lo lleva. Por eso la función es propia.
    expect(formatEuros(120_000)).toBe('1.200,00 €')
  })

  it('escribe siempre los dos decimales, aunque sean cero', () => {
    expect(formatEuros(7_200)).toBe('72,00 €')
  })

  it('rellena con un cero los céntimos de una sola cifra', () => {
    // 1.205 céntimos son 12,05 €, no 12,5 €.
    expect(formatEuros(1_205)).toBe('12,05 €')
  })

  it('no pierde los céntimos que no acaban en cero', () => {
    expect(formatEuros(199_999)).toBe('1.999,99 €')
  })

  it('muestra un importe menor de un euro con el cero delante', () => {
    expect(formatEuros(50)).toBe('0,50 €')
  })

  it('formatea el cero', () => {
    expect(formatEuros(0)).toBe('0,00 €')
  })

  it('pone un separador por cada grupo de tres cifras', () => {
    expect(formatEuros(1_000_000_000)).toBe('10.000.000,00 €')
  })

  it('formatea un importe negativo con el signo delante', () => {
    // Un descuento se muestra en negativo (Fase 6). La conversión provisional
    // de la Fase 2 devolvía aquí «-62,-50 €»: el resto de la división entre 100
    // también sale negativo, y el signo acababa duplicado dentro del importe.
    expect(formatEuros(-6_250)).toBe('-62,50 €')
  })

  it('formatea un importe negativo menor de un euro', () => {
    expect(formatEuros(-50)).toBe('-0,50 €')
  })

  it('formatea un importe negativo con separador de millares', () => {
    expect(formatEuros(-1_234_567)).toBe('-12.345,67 €')
  })

  it('rechaza un número con decimales', () => {
    // Un céntimo con decimales significa que el dinero se ha ido a coma
    // flotante en algún punto del cálculo. Redondear aquí y seguir ocultaría el
    // error justo donde se vuelve visible. Decisión del usuario en la Fase 3.
    expect(() => formatEuros(12.5)).toThrow(/entero/)
  })

  it('rechaza un valor que no es un número', () => {
    expect(() => formatEuros(Number.NaN)).toThrow(/entero/)
  })

  it('rechaza un valor infinito', () => {
    expect(() => formatEuros(Number.POSITIVE_INFINITY)).toThrow(/entero/)
  })
})
