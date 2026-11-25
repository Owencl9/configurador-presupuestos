import { describe, expect, it } from 'vitest'

import { formatSpanishDate } from './formatSpanishDate'

/*
 * Todas las fechas de este archivo son **fechas fijas**, nunca `new Date()`.
 *
 * Un test que construye la fecha de hoy compara el resultado con el mismo
 * cálculo que hace la implementación: pasa siempre, incluso si las dos cosas
 * están mal. Y los tests se ejecutarán en otra máquina y otro día (GitHub
 * Actions, Fase 9), así que un test que depende del calendario es un test que
 * falla solo algún día del año.
 *
 * Las fechas se construyen con `new Date(año, mes, día)`, que interpreta los
 * componentes en la **zona horaria local**, igual que hará la fecha de emisión
 * real de un presupuesto. El mes va de 0 a 11: el 10 es noviembre.
 */
describe('formatSpanishDate', () => {
  it('escribe la fecha en el formato español día/mes/año', () => {
    expect(formatSpanishDate(new Date(2026, 10, 25))).toBe('25/11/2026')
  })

  it('rellena con un cero el día y el mes de una sola cifra', () => {
    expect(formatSpanishDate(new Date(2026, 0, 5))).toBe('05/01/2026')
  })

  it('cuenta los meses desde 1, no desde 0 como JavaScript', () => {
    // Si la implementación olvidara el +1 de `getMonth`, diciembre saldría
    // como 11 y este test lo diría. Es el error clásico de las fechas en
    // JavaScript: `getMonth()` de diciembre devuelve 11, no 12.
    expect(formatSpanishDate(new Date(2026, 11, 31))).toBe('31/12/2026')
    expect(formatSpanishDate(new Date(2026, 0, 1))).toBe('01/01/2026')
  })

  it('escribe el 29 de febrero de un año bisiesto', () => {
    expect(formatSpanishDate(new Date(2028, 1, 29))).toBe('29/02/2028')
  })

  it('escribe el año con cuatro cifras', () => {
    expect(formatSpanishDate(new Date(2030, 5, 7))).toBe('07/06/2030')
  })

  it('usa la fecha local y no la UTC', () => {
    /*
     * El control de este test es la hora: 23:30 del día 25. Una implementación
     * escrita con `toISOString()` —la forma más corta de sacar una fecha de un
     * `Date`— convierte a UTC, y en cualquier zona horaria adelantada eso
     * devolvería el día 26. En Canarias y en la península el resultado sería
     * correcto por casualidad en invierno y erróneo en verano.
     *
     * Lo que se muestra en un presupuesto es la fecha del día del cliente, así
     * que la implementación tiene que leer los componentes locales.
     */
    expect(formatSpanishDate(new Date(2026, 10, 25, 23, 30))).toBe('25/11/2026')
    expect(formatSpanishDate(new Date(2026, 10, 25, 0, 15))).toBe('25/11/2026')
  })

  it('no modifica la fecha que recibe', () => {
    const emision = new Date(2026, 10, 25, 12, 0)
    const antes = emision.getTime()

    formatSpanishDate(emision)

    expect(emision.getTime()).toBe(antes)
  })

  it('lanza un error con una fecha inválida', () => {
    /*
     * `new Date('no es una fecha')` no lanza: devuelve un `Date` cuyo tiempo es
     * `NaN`. Formatearlo daría «NaN/NaN/NaN» impreso en un documento que alguien
     * va a enviar a un cliente. Mismo criterio que `formatEuros` con los
     * decimales: se lanza donde el dato es imposible, no se disimula.
     */
    expect(() => formatSpanishDate(new Date('no es una fecha'))).toThrow(
      /fecha válida/i,
    )
  })
})
