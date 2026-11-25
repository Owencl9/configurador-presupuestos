import { describe, expect, it } from 'vitest'

import { BUDGET_VALIDITY_DAYS } from '../../shared/constants/business-rules'
import { formatSpanishDate } from '../../shared/utils/formatSpanishDate'

import { calculateValidUntil } from './budgetValidity'

/*
 * Fechas fijas, nunca `new Date()`. El motivo está explicado en
 * `formatSpanishDate.test.ts`: un test que construye la fecha de hoy compara el
 * resultado contra el mismo cálculo que prueba.
 *
 * Los resultados esperados están **calculados a mano** y escritos como texto
 * con `formatSpanishDate`, no como componentes de un `Date`. Así el fallo dice
 * «esperaba 25/12/2026 y he recibido 24/12/2026» en lugar de comparar dos
 * marcas de tiempo de trece cifras.
 */
describe('calculateValidUntil', () => {
  it('suma los 30 días de validez a la fecha de emisión', () => {
    const emision = new Date(2026, 10, 25)

    expect(formatSpanishDate(calculateValidUntil(emision))).toBe('25/12/2026')
  })

  it('usa por defecto los días de validez del archivo de constantes', () => {
    /*
     * Llamarla sin segundo argumento tiene que dar el mismo resultado que
     * pasarle la constante. Si alguien cambia la validez a 15 días en el archivo
     * de reglas, el valor por defecto cambia con ella y este test lo comprueba
     * sin tener que tocarlo.
     */
    const emision = new Date(2026, 10, 25)

    expect(calculateValidUntil(emision).getTime()).toBe(
      calculateValidUntil(emision, BUDGET_VALIDITY_DAYS).getTime(),
    )
  })

  it('cruza el cambio de mes', () => {
    // 31 de enero de 2027 + 30 días. Febrero de 2027 tiene 28 días: el día +1
    // es el 1 de febrero y el +28 es el 28, así que el +30 es el 2 de marzo.
    const emision = new Date(2027, 0, 31)

    expect(formatSpanishDate(calculateValidUntil(emision))).toBe('02/03/2027')
  })

  it('cuenta el 29 de febrero de un año bisiesto', () => {
    /*
     * El mismo 31 de enero, un año antes. 2028 **sí** es bisiesto, así que
     * febrero tiene 29 días y el resultado cae un día antes que en 2027: el 1
     * de marzo, no el 2.
     *
     * Esta pareja de tests es la que demuestra que el cálculo no suma
     * «30 × 24 × 60 × 60 × 1000 milisegundos» a ciegas ni da por hecho que los
     * meses tienen 30 días.
     */
    const emision = new Date(2028, 0, 31)

    expect(formatSpanishDate(calculateValidUntil(emision))).toBe('01/03/2028')
  })

  it('cruza el cambio de año', () => {
    // 15 de diciembre de 2026 + 30 días: quedan 16 días de diciembre y sobran
    // 14, así que la validez termina el 14 de enero del año siguiente.
    const emision = new Date(2026, 11, 15)

    expect(formatSpanishDate(calculateValidUntil(emision))).toBe('14/01/2027')
  })

  it('conserva la hora del día', () => {
    /*
     * El presupuesto nunca muestra la hora, pero conservarla es lo que hace que
     * el cálculo sea estable: si la implementación llevara la fecha a medianoche
     * o sumara milisegundos, un cambio de horario de verano entre las dos fechas
     * podría mover el día. Sumando días al componente del día, el horario de
     * verano no interviene.
     */
    const emision = new Date(2026, 10, 25, 23, 30, 15)
    const validez = calculateValidUntil(emision)

    expect(validez.getHours()).toBe(23)
    expect(validez.getMinutes()).toBe(30)
    expect(validez.getSeconds()).toBe(15)
  })

  it('no modifica la fecha de emisión que recibe', () => {
    /*
     * El error más fácil de cometer aquí: `emision.setDate(emision.getDate() +
     * 30)` funciona y devuelve la fecha correcta, pero **cambia el objeto que ha
     * recibido**. El documento muestra las dos fechas, así que la emisión
     * también pasaría a ser el 25 de diciembre y las dos saldrían iguales.
     */
    const emision = new Date(2026, 10, 25, 12, 0)
    const antes = emision.getTime()

    calculateValidUntil(emision)

    expect(emision.getTime()).toBe(antes)
    expect(formatSpanishDate(emision)).toBe('25/11/2026')
  })

  it('devuelve una fecha distinta de la que recibe', () => {
    // No es lo mismo que el test anterior: este comprueba que no devuelve el
    // mismo objeto, aunque no lo haya modificado. `toBe` compara identidad.
    const emision = new Date(2026, 10, 25)

    expect(calculateValidUntil(emision)).not.toBe(emision)
  })

  it('admite un número de días distinto del valor por defecto', () => {
    const emision = new Date(2026, 10, 25)

    expect(formatSpanishDate(calculateValidUntil(emision, 1))).toBe(
      '26/11/2026',
    )
    expect(formatSpanishDate(calculateValidUntil(emision, 60))).toBe(
      '24/01/2027',
    )
  })

  it('con cero días devuelve la misma fecha', () => {
    // Caso borde del rango permitido. Un presupuesto que caduca el día que se
    // emite es absurdo como regla de negocio, pero el cálculo tiene que ser
    // predecible en el extremo: cero días no mueve la fecha.
    const emision = new Date(2026, 10, 25)

    expect(formatSpanishDate(calculateValidUntil(emision, 0))).toBe(
      '25/11/2026',
    )
  })

  it('lanza un error con una fecha de emisión inválida', () => {
    expect(() => calculateValidUntil(new Date('no es una fecha'))).toThrow(
      /fecha válida/i,
    )
  })

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'lanza un error con %p días de validez',
    (dias) => {
      /*
       * Los días de validez no vienen del navegador, vienen del archivo de
       * constantes. La validación existe porque ese archivo está hecho para
       * editarse a mano: un `30.5` escrito por error daría una fecha con horas
       * raras, y un negativo, una validez que caduca antes de emitirse.
       */
      expect(() => calculateValidUntil(new Date(2026, 10, 25), dias)).toThrow(
        /entero/i,
      )
    },
  )
})
