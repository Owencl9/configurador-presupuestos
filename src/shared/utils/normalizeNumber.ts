/** Límites dentro de los que tiene que quedar el resultado. Ambos incluidos. */
export interface NumberRange {
  readonly min: number
  readonly max: number
}

/**
 * Convierte un valor cualquiera en un entero dentro de un rango.
 *
 * Es la puerta por la que entran los números que no vienen del código:
 * los que escribe una persona en un selector (Fase 4) y los que aparecen en un
 * borrador guardado en `localStorage` (Fase 5). Por eso recibe `unknown` y no
 * `number`: si solo aceptara números, alguien tendría que convertir antes de
 * llamarla, y esa conversión sin comprobar es justo el error que esta función
 * existe para evitar.
 *
 * ## Las dos clases de valor malo, que no se tratan igual
 *
 * - **Un número fuera de rango** se acerca al rango: por debajo del mínimo
 *   sube al mínimo, y por encima del máximo **baja al máximo**, no al mínimo.
 *   Quien escribe 500 meses quería muchos meses, así que se le dan los que hay.
 *   Devolver el mínimo en los dos casos haría parecer que el campo no funciona.
 * - **Un valor que no es un número** —vacío, texto, `null`, un objeto, `NaN`,
 *   infinito— devuelve el **mínimo**, que es el único valor siempre válido y,
 *   en una línea de presupuesto, el más barato: un dato corrupto nunca infla un
 *   importe.
 *
 * Los decimales se **truncan** antes de aplicar los límites, no se redondean:
 * 6,9 meses es «6 meses y algo», y ese algo no se puede contratar. El orden
 * importa, porque 5,9 trunca a 5 y entonces sube al mínimo.
 *
 * @param raw Lo que haya que normalizar. Cualquier cosa.
 * @param range Mínimo y máximo, ambos incluidos.
 */
export function normalizeNumber(raw: unknown, range: NumberRange): number {
  const { min, max } = range

  /*
   * El tipo se comprueba antes de convertir, y no al revés, porque las
   * conversiones de JavaScript son demasiado complacientes: `Number(true)` es
   * 1, `Number([])` es 0 y `Number([12])` es 12. Convertir primero y comprobar
   * después dejaría pasar valores con pinta de legítimos.
   */
  if (typeof raw !== 'number' && typeof raw !== 'string') {
    return min
  }

  /*
   * `Number(' ')` y `Number('')` son 0, no `NaN`, así que una cadena en blanco
   * se colaría como un cero —y un cero por debajo del mínimo subiría al mínimo
   * igualmente, pero por el camino equivocado y con otro significado—. Se
   * descarta aquí, de forma explícita.
   */
  if (typeof raw === 'string' && raw.trim() === '') {
    return min
  }

  // `Number` y no `parseInt`: `parseInt('12meses')` devuelve 12, y una cadena
  // medio numérica es un dato que no se entiende, no un 12.
  const numero = Number(raw)

  // Descarta `NaN` e infinito de una vez. Infinito no se trata como «por
  // encima del máximo»: nadie puede haber querido escribirlo, así que es un
  // dato inválido, no un valor fuera de rango.
  if (!Number.isFinite(numero)) {
    return min
  }

  const entero = Math.trunc(numero)

  return Math.min(Math.max(entero, min), max)
}
