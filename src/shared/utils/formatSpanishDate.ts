/**
 * Convierte una fecha al formato español `25/11/2026`.
 *
 * Es a las fechas lo que `formatEuros` es al dinero: el **único** punto del
 * proyecto donde una fecha deja de ser un `Date` y pasa a ser texto. Vive en
 * `shared/utils/` por la misma razón que los otros formateadores —no conoce
 * ninguna regla de negocio y no importa nada de `features/`—, aunque hoy la use
 * solo el documento de la Fase 7.
 *
 * ## Por qué lee los componentes locales y no usa `toISOString()`
 *
 * `toISOString()` es la forma más corta de sacar una fecha de un `Date`, y es la
 * equivocada aquí: convierte a UTC. A las 23:30 del 25 de noviembre en cualquier
 * zona horaria adelantada devolvería el día 26, y en Canarias acertaría en
 * invierno y fallaría en verano. Lo que lleva impreso un presupuesto es la fecha
 * del día de quien lo emite, así que se leen `getDate`, `getMonth` y
 * `getFullYear`, que son locales.
 *
 * `Intl.DateTimeFormat` tampoco se usa, por los mismos motivos por los que
 * `formatEuros` no usa `Intl.NumberFormat`: el resultado depende de los datos de
 * idiomas de cada versión de Node, y los tests se ejecutarán en otra máquina
 * (GitHub Actions, Fase 9). Escrito a mano, el resultado es exactamente
 * predecible.
 */
export function formatSpanishDate(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    /*
     * `new Date('cualquier cosa')` no lanza: devuelve un `Date` cuyo tiempo es
     * `NaN`. Sin esta comprobación, el documento imprimiría «NaN/NaN/NaN» en la
     * fecha de un presupuesto que alguien va a enviar a un cliente. Mismo
     * criterio que `formatEuros` con los decimales: se lanza donde el dato es
     * imposible, en lugar de disimularlo.
     */
    throw new Error(
      'formatSpanishDate espera una fecha válida y ha recibido una fecha inválida.',
    )
  }

  // Dos cifras siempre: el día 5 es «05». `getMonth` devuelve 0 para enero, de
  // ahí el +1.
  const dia = String(date.getDate()).padStart(2, '0')
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const anio = date.getFullYear()

  return `${dia}/${mes}/${anio}`
}
