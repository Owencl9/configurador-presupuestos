/**
 * Prefijo de los números de presupuesto.
 *
 * Está aquí y no en el archivo de reglas de negocio porque no es una regla de
 * negocio: es parte del formato, y este archivo **es** el formato. Cambiarlo
 * cambia el aspecto de los números nuevos, no el cálculo de nada.
 */
const PREFIX = 'PRE'

/** Cifras mínimas del contador. Es un mínimo, no un máximo: ver la función. */
const MIN_COUNTER_DIGITS = 4

/**
 * Construye el número de un presupuesto: `PRE-2026-0001`.
 *
 * **Es el único sitio del proyecto que decide la forma de un número de
 * presupuesto.** Quién lo reparte y cuándo avanza el contador es trabajo de
 * `budgetNumberStorage`; esta función solo da forma a dos números.
 *
 * ## Por qué el año llega por parámetro
 *
 * Podría leerlo con `new Date().getFullYear()` y ahorrar un argumento. No lo
 * hace por dos motivos: una función que consulta el reloj no se puede probar
 * con un año fijo, y el año que lleva el número tiene que ser **el mismo que la
 * fecha de emisión impresa en el documento**. Si cada uno consultara la hora por
 * su cuenta, un presupuesto emitido el 31 de diciembre a las 23:59:59 podría
 * llevar dos años distintos en la misma hoja.
 *
 * ## Por encima de 9999 crece, no vuelve a empezar
 *
 * El relleno con ceros es un mínimo de cuatro cifras. El presupuesto número
 * 10.000 es `PRE-2026-10000`, con cinco. Las dos alternativas son peores:
 * volver a 1 repetiría un número, y truncar a cuatro cifras daría
 * `PRE-2026-0000`. Un número de presupuesto repetido es justo lo que un número
 * de presupuesto sirve para evitar.
 */
export function formatBudgetNumber(year: number, counter: number): string {
  if (!Number.isInteger(year) || year < 1000 || year > 9999) {
    throw new Error(
      `formatBudgetNumber espera un año de cuatro cifras y ha recibido ${year}.`,
    )
  }

  if (!Number.isInteger(counter) || counter < 1) {
    /*
     * El contador viene de `localStorage`, donde puede haber cualquier cosa.
     * Validarlo es trabajo de `parseBudgetCounter`, pero esta función también
     * lanza: un `NaN` que llegue hasta aquí acabaría impreso en el documento de
     * un cliente como «PRE-2026-NaN». `Number.isInteger` descarta de una vez
     * los decimales, `NaN` y los infinitos.
     */
    throw new Error(
      `formatBudgetNumber espera un contador entero de 1 en adelante y ha recibido ${counter}.`,
    )
  }

  const contador = String(counter).padStart(MIN_COUNTER_DIGITS, '0')

  return `${PREFIX}-${year}-${contador}`
}
