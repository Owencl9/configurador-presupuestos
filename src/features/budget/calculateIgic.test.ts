import { describe, expect, it } from 'vitest'

import { IGIC_RATE_PERCENT } from '../../shared/constants/business-rules'
import { calculateIgic } from './calculateIgic'

/*
 * El tipo se pasa por parámetro y no se lee de las constantes dentro de la
 * función, para poder probar tipos que hoy no están configurados —el 0 % y el
 * 9,5 %— sin tocar la configuración real del proyecto. Mismo criterio que con
 * `groupServicesByCategory` en la Fase 2.
 *
 * Las decisiones que estos tests fijan están en
 * docs/adr/0007-redondeo-del-igic.md.
 */
describe('calculateIgic', () => {
  it('calcula el 7 % de una base exacta', () => {
    // 1.200,00 € → 84,00 €
    expect(calculateIgic(120_000, 7)).toBe(8_400)
  })

  it('devuelve cero con una base de cero', () => {
    expect(calculateIgic(0, 7)).toBe(0)
  })

  it('devuelve cero con un tipo del 0 %', () => {
    // Hay servicios exentos de IGIC. El cálculo no debe romperse con el tipo 0.
    expect(calculateIgic(120_000, 0)).toBe(0)
  })

  it('redondea hacia arriba cuando el empate cae justo en medio céntimo', () => {
    // 7 % de 50 céntimos son 3,5 céntimos exactos. Redondeo comercial: 4.
    // Es un empate de verdad, no un número con error de coma flotante: el
    // cociente vale 3.5 exacto, porque los medios tienen representación binaria
    // exacta. La regla lo decide, no el azar del coma flotante.
    expect(calculateIgic(50, 7)).toBe(4)
  })

  it('redondea hacia abajo cuando no llega a medio céntimo', () => {
    // 7 % de 7 céntimos son 0,49 céntimos.
    expect(calculateIgic(7, 7)).toBe(0)
    // 7 % de 21 céntimos son 1,47 céntimos.
    expect(calculateIgic(21, 7)).toBe(1)
  })

  it('admite un tipo con medio punto', () => {
    // El 9,5 % es uno de los tipos incrementados del IGIC. Funciona exacto por
    // el mismo motivo que el empate de arriba.
    expect(calculateIgic(20_000, 9.5)).toBe(1_900)
    expect(calculateIgic(100, 9.5)).toBe(10) // 9,5 → empate → 10
  })

  it('no pierde precisión con un importe muy grande', () => {
    // 9.999.999,99 € de base. Multiplicar por el entero 7 antes de dividir
    // mantiene el producto dentro de los enteros exactos de JavaScript.
    expect(calculateIgic(999_999_999, 7)).toBe(70_000_000)
  })

  it('devuelve siempre un número entero de céntimos', () => {
    const bases = [1, 7, 13, 49, 50, 99, 12_345, 999_983]

    for (const base of bases) {
      const igic = calculateIgic(base, IGIC_RATE_PERCENT)
      expect(Number.isInteger(igic), `base ${base} → ${igic}`).toBe(true)
    }
  })

  it('nunca se aleja más de medio céntimo del porcentaje exacto', () => {
    /*
     * La propiedad que define un redondeo correcto, comprobada sobre muchas
     * bases en lugar de sobre una. Si alguien sustituyera `Math.round` por
     * `Math.floor` o `Math.ceil`, este test caería aunque los casos concretos
     * de arriba siguieran pasando.
     */
    for (let base = 0; base <= 5_000; base += 7) {
      const exacto = (base * IGIC_RATE_PERCENT) / 100
      expect(
        Math.abs(calculateIgic(base, IGIC_RATE_PERCENT) - exacto),
        `base ${base}`,
      ).toBeLessThanOrEqual(0.5)
    }
  })
})
