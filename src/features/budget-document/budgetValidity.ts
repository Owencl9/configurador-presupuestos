import { BUDGET_VALIDITY_DAYS } from '../../shared/constants/business-rules'

/**
 * La fecha hasta la que vale un presupuesto: la de emisión más los días de
 * validez (30, apartado 4.5 de la especificación).
 *
 * ## Por qué suma días y no milisegundos
 *
 * La forma corta sería `new Date(emision.getTime() + dias * 86_400_000)`. Es
 * incorrecta dos veces:
 *
 * 1. **El horario de verano.** Entre dos fechas separadas por 30 días puede
 *    haber un cambio de hora, y entonces no hay 24 horas exactas en cada día.
 *    La suma de milisegundos movería la fecha un día en algunos casos.
 * 2. **Los meses no tienen 30 días.** Sumar días al componente del día deja que
 *    el propio `Date` resuelva el desbordamiento: el 31 de enero más 30 días es
 *    el 2 de marzo en un año normal y el 1 de marzo en uno bisiesto, y eso lo
 *    sabe el calendario, no una multiplicación.
 *
 * ## Por qué no modifica la fecha que recibe
 *
 * `emision.setDate(...)` daría el resultado correcto **y cambiaría el objeto
 * recibido**. El documento muestra las dos fechas, la de emisión y la de
 * validez, así que la emisión pasaría a ser también el 25 de diciembre y las
 * dos saldrían iguales. Por eso se copia primero. Hay un test para cada una de
 * las dos cosas: que no muta y que no devuelve el mismo objeto.
 *
 * @param issueDate Fecha de emisión del presupuesto.
 * @param days Días de validez. Por defecto, los del archivo de constantes.
 */
export function calculateValidUntil(
  issueDate: Date,
  days: number = BUDGET_VALIDITY_DAYS,
): Date {
  if (Number.isNaN(issueDate.getTime())) {
    throw new Error(
      'calculateValidUntil espera una fecha válida de emisión y ha recibido una fecha inválida.',
    )
  }

  if (!Number.isInteger(days) || days < 0) {
    /*
     * Los días de validez no vienen del navegador: vienen del archivo de
     * constantes, que está hecho para editarse a mano. Un `30.5` escrito por
     * error daría una fecha con horas extrañas, y un negativo, un presupuesto
     * que caduca antes de emitirse. `Number.isInteger` descarta de una vez los
     * decimales, `NaN` y los infinitos.
     */
    throw new Error(
      `calculateValidUntil espera un número entero de días no negativo y ha recibido ${days}.`,
    )
  }

  const validez = new Date(issueDate.getTime())
  validez.setDate(validez.getDate() + days)

  return validez
}
