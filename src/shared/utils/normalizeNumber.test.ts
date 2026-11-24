import { describe, expect, it } from 'vitest'

import { normalizeNumber } from './normalizeNumber'

/*
 * Los límites se pasan explícitos en todos los tests, no leídos de
 * `business-rules.ts`. Mismo criterio que con el tipo de IGIC en la Fase 3:
 * cambiar la configuración del proyecto no debe romper tests que no hablan de
 * configuración. Se usan 6 y 36, que son los de un servicio de SEO.
 */
const MESES = { min: 6, max: 36 }
const CANTIDAD = { min: 1, max: 99 }

describe('normalizeNumber', () => {
  describe('valores correctos', () => {
    it('deja un número dentro del rango tal como está', () => {
      expect(normalizeNumber(12, MESES)).toBe(12)
    })

    it('acepta el mínimo y el máximo exactos', () => {
      // Los extremos son válidos: la comparación es «fuera del rango», no
      // «igual al límite». Un error de un paso aquí dejaría el mínimo sin poder
      // elegirse, que es justo el valor con el que nacen las líneas.
      expect(normalizeNumber(6, MESES)).toBe(6)
      expect(normalizeNumber(36, MESES)).toBe(36)
    })

    it('acepta una cadena de números, que es lo que da un campo de texto', () => {
      // Un `<input>` del navegador devuelve siempre una cadena, incluso cuando
      // es de tipo numérico. Si esta función solo aceptara números, alguien
      // tendría que convertir antes, y ahí es donde se cuela el error que esta
      // función existe para evitar.
      expect(normalizeNumber('12', MESES)).toBe(12)
    })

    it('ignora los espacios alrededor', () => {
      expect(normalizeNumber('  12  ', MESES)).toBe(12)
    })
  })

  describe('decimales', () => {
    it('trunca los decimales en lugar de redondearlos', () => {
      // Truncar es más predecible para algo que son unidades: 6,9 meses es «6
      // meses y algo», y ese algo no se puede contratar.
      expect(normalizeNumber(6.9, MESES)).toBe(6)
      expect(normalizeNumber('6.9', MESES)).toBe(6)
    })

    it('trunca antes de aplicar el mínimo, no después', () => {
      // 6,9 trunca a 6, que es válido. Pero 5,9 trunca a 5, que está por debajo
      // del mínimo, y entonces sube a 6. El orden importa: redondeando primero,
      // 5,9 se habría quedado en 6 por otro camino y este test no distinguiría
      // las dos implementaciones.
      expect(normalizeNumber(5.9, MESES)).toBe(6)
    })
  })

  describe('fuera de rango', () => {
    it('sube al mínimo lo que está por debajo', () => {
      expect(normalizeNumber(2, MESES)).toBe(6)
      expect(normalizeNumber(0, CANTIDAD)).toBe(1)
    })

    it('baja al máximo lo que está por encima, y no al mínimo', () => {
      /*
       * El test que pidió el usuario explícitamente. Un error muy fácil de
       * cometer es tratar todo lo inválido igual y devolver el mínimo: quien
       * escribe 500 meses se encontraría con 6, y parecería que el campo no
       * funciona. Lo correcto es quedarse en el tope, que es lo más cerca que
       * se puede estar de lo que se pedía.
       */
      expect(normalizeNumber(500, MESES)).toBe(36)
      expect(normalizeNumber(500, MESES)).not.toBe(6)
      expect(normalizeNumber(1000, CANTIDAD)).toBe(99)
    })

    it('sube al mínimo los números negativos', () => {
      expect(normalizeNumber(-5, MESES)).toBe(6)
      expect(normalizeNumber('-12', CANTIDAD)).toBe(1)
    })
  })

  describe('lo que no es un número', () => {
    /*
     * Todo esto va al mínimo, que es el valor seguro: es el único que siempre
     * es válido, y en una línea de presupuesto es además el más barato, así que
     * un dato corrupto nunca infla un importe.
     *
     * Estos casos no son hipótesis. Desde la Fase 5 esta función valida lo que
     * se lea de `localStorage`, donde puede haber cualquier cosa: un borrador
     * de una versión anterior, un campo editado a mano o un JSON a medias.
     */
    it('devuelve el mínimo con una cadena vacía', () => {
      // El caso más frecuente de todos: la persona borra el campo para escribir
      // otro número. Ojo, porque `Number('')` es 0, no un error.
      expect(normalizeNumber('', MESES)).toBe(6)
      expect(normalizeNumber('   ', MESES)).toBe(6)
    })

    it('devuelve el mínimo con texto', () => {
      expect(normalizeNumber('doce', MESES)).toBe(6)
      // `parseInt('12meses')` daría 12, y por eso esta función no usa
      // `parseInt`: una cadena medio numérica es un dato que no se entiende,
      // no un 12.
      expect(normalizeNumber('12meses', MESES)).toBe(6)
    })

    it('devuelve el mínimo con NaN y con infinito', () => {
      expect(normalizeNumber(Number.NaN, MESES)).toBe(6)
      // Infinito no se trata como «por encima del máximo» a propósito: no es un
      // número que alguien haya podido querer escribir, así que es un dato
      // inválido y no un valor fuera de rango.
      expect(normalizeNumber(Number.POSITIVE_INFINITY, MESES)).toBe(6)
      expect(normalizeNumber(Number.NEGATIVE_INFINITY, MESES)).toBe(6)
    })

    it('devuelve el mínimo con null y con undefined', () => {
      expect(normalizeNumber(null, MESES)).toBe(6)
      expect(normalizeNumber(undefined, MESES)).toBe(6)
    })

    it('devuelve el mínimo con objetos, listas y booleanos', () => {
      // `Number(true)` es 1 y `Number([])` es 0: convertir sin comprobar el
      // tipo daría valores con pinta de legítimos.
      expect(normalizeNumber({ meses: 12 }, MESES)).toBe(6)
      expect(normalizeNumber([12], MESES)).toBe(6)
      expect(normalizeNumber(true, CANTIDAD)).toBe(1)
    })
  })

  it('devuelve siempre un número entero', () => {
    const entradas: unknown[] = [
      12,
      '12',
      6.9,
      -3,
      500,
      '',
      'doce',
      null,
      undefined,
      Number.NaN,
      { a: 1 },
    ]

    for (const entrada of entradas) {
      const resultado = normalizeNumber(entrada, MESES)

      expect(
        Number.isInteger(resultado),
        `«${String(entrada)}» no devolvió un entero`,
      ).toBe(true)
      expect(resultado).toBeGreaterThanOrEqual(MESES.min)
      expect(resultado).toBeLessThanOrEqual(MESES.max)
    }
  })
})
