import { describe, expect, it } from 'vitest'

import { calculatePercentCents } from './calculatePercentCents'

/*
 * Esta función es el único sitio del proyecto que calcula un porcentaje de un
 * importe. La usan el IGIC (Fase 3) y las tres estrategias de descuento
 * (Fase 6), así que el redondeo del proyecto se decide aquí y en ningún otro
 * sitio. Las tres decisiones que encierra están razonadas en
 * [ADR 0007](../../../docs/adr/0007-redondeo-del-igic.md).
 */
describe('calculatePercentCents', () => {
  it('calcula un porcentaje exacto de un importe', () => {
    // El 7 % de 1.200,00 € son 84,00 €.
    expect(calculatePercentCents(120_000, 7)).toBe(8_400)
  })

  it('devuelve céntimos enteros', () => {
    // El 5 % de 450,10 € son 22,505 €: la función no puede devolver medios
    // céntimos, porque no existen.
    expect(Number.isInteger(calculatePercentCents(45_010, 5))).toBe(true)
  })

  it('redondea al céntimo más cercano hacia abajo cuando corresponde', () => {
    // El 5 % de 450,01 € son 22,5005 €, más cerca de 22,50 que de 22,51.
    expect(calculatePercentCents(45_001, 5)).toBe(2_250)
  })

  it('redondea al céntimo más cercano hacia arriba cuando corresponde', () => {
    // El 7 % de 0,99 € son 0,0693 €: seis céntimos y pico, más cerca de 7 que
    // de 6.
    expect(calculatePercentCents(99, 7)).toBe(7)
  })

  it('resuelve el empate de medio céntimo hacia arriba', () => {
    /*
     * **El test que fija el redondeo comercial.** El 5 % de 1,00 € son
     * exactamente 0,05 €, pero el 5 % de 0,10 € son exactamente medio céntimo:
     * 0,005. Un empate no tiene «el más cercano», así que hay que elegir, y el
     * proyecto elige hacia arriba, que es lo que hace cualquiera comprobando
     * una factura con una calculadora.
     *
     * Este test es además el que demuestra que la función **multiplica por el
     * porcentaje entero y divide al final**. Con la forma de factor
     * (`base * 0.05`), el valor intermedio no es el número matemático exacto y
     * el empate deja de ser un empate: lo decidiría el error de
     * representación binaria y no la regla de negocio.
     */
    expect(calculatePercentCents(10, 5)).toBe(1)
    expect(calculatePercentCents(30, 5)).toBe(2) // 1,5 → 2
    expect(calculatePercentCents(50, 5)).toBe(3) // 2,5 → 3
  })

  it('admite porcentajes con medio punto', () => {
    // El 9,5 % es uno de los tipos incrementados del IGIC. Tiene
    // representación binaria exacta, igual que el 7 %: ver el ADR 0007.
    expect(calculatePercentCents(100_000, 9.5)).toBe(9_500)
  })

  it('devuelve cero con un porcentaje del cero por ciento', () => {
    expect(calculatePercentCents(250_000, 0)).toBe(0)
  })

  it('devuelve el importe completo con un porcentaje del cien por cien', () => {
    expect(calculatePercentCents(250_000, 100)).toBe(250_000)
  })

  it('devuelve cero con un importe de cero', () => {
    // Es el caso de un bloque de pago vacío: un presupuesto sin servicios
    // anuales no tiene ni IGIC ni descuento en el bloque anual.
    expect(calculatePercentCents(0, 7)).toBe(0)
  })

  it('no pierde precisión con importes grandes', () => {
    // 99 unidades del servicio más caro del catálogo: 247.500,00 €. El tope de
    // cantidad de la Fase 4 mantiene la aritmética muy lejos de los límites de
    // JavaScript, y este test lo deja comprobado.
    expect(calculatePercentCents(24_750_000, 7)).toBe(1_732_500)
  })
})
