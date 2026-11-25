import { readJson, writeJson } from '../../shared/utils/safeLocalStorage'
import {
  BUDGET_COUNTER_STORAGE_KEY,
  MAX_BUDGET_COUNTER,
} from './budgetCounterFormat'
import { formatBudgetNumber } from './budgetNumberFormat'
import { parseBudgetCounter } from './parseBudgetCounter'

/**
 * Reparte el número del presupuesto y avanza el contador del navegador.
 *
 * Es la **única** pieza del número que tiene efectos secundarios. Las tres que
 * usa son puras o devuelven valores en lugar de lanzar: `parseBudgetCounter`
 * valida, `formatBudgetNumber` da forma y `safeLocalStorage` habla con el
 * navegador sin poder romper nada. Aquí solo se decide el orden.
 *
 * ## Cuándo se llama (decisión del usuario al autorizar la Fase 7)
 *
 * **Una sola vez, al abrir el documento por primera vez.** No al cargar la
 * aplicación, porque entonces cada visita que no llega a presupuestar nada
 * quemaría un número; y no en cada impresión, porque imprimir dos veces el
 * mismo presupuesto daría dos números distintos. Quien lo decide es el
 * componente: esta función reparte un número cada vez que se la llama.
 *
 * «Empezar de nuevo» también olvida el número asignado —lo que viene después es
 * otro presupuesto—, así que el documento siguiente llama otra vez y recibe uno
 * nuevo. El contador **no** se borra: si se borrara, el presupuesto siguiente
 * repetiría el número del anterior.
 *
 * ## Una numeración por navegador
 *
 * Sin servidor (ADR 0002), el contador vive en el navegador de quien usa la
 * aplicación, así que dos personas distintas pueden recibir las dos un
 * `PRE-2026-0001`. Razonado en el ADR 0012.
 *
 * @param issueDate Fecha de emisión. De ella sale el año de la serie, para que
 * el año del número y el de la fecha impresa no puedan discrepar.
 * @returns El número ya formateado, `PRE-2026-0001`.
 */
export function assignBudgetNumber(issueDate: Date): string {
  if (Number.isNaN(issueDate.getTime())) {
    throw new Error(
      'assignBudgetNumber espera una fecha válida de emisión y ha recibido una fecha inválida.',
    )
  }

  const anio = issueDate.getFullYear()
  const guardado = parseBudgetCounter(readJson(BUDGET_COUNTER_STORAGE_KEY))

  /*
   * Tres situaciones llevan al mismo sitio, el número 1: no había contador, lo
   * que había estaba dañado, o era de otro año. Las dos primeras son la norma
   * del apartado 4.6 —lo que no se entiende se descarta y se empieza de cero— y
   * la tercera es que la numeración es anual, porque el año va dentro del
   * número.
   */
  const continuaLaSerie = guardado !== null && guardado.year === anio
  const siguiente = continuaLaSerie ? guardado.lastNumber + 1 : 1

  /*
   * Al desbordar el tope, la serie vuelve a empezar. Es inalcanzable en un uso
   * real —cien mil presupuestos desde el mismo navegador— pero el
   * comportamiento está decidido en lugar de improvisado: sin esta línea se
   * guardaría un valor que `parseBudgetCounter` rechazaría en la visita
   * siguiente, y la serie se reiniciaría igual, solo que de forma accidental.
   */
  const numero = siguiente > MAX_BUDGET_COUNTER ? 1 : siguiente

  /*
   * Si el navegador no permite escribir, no pasa nada más: `writeJson` devuelve
   * `false` en lugar de lanzar y el documento sale con su número igualmente. Lo
   * que se pierde es la memoria de cuál fue el último, no el número.
   */
  writeJson(BUDGET_COUNTER_STORAGE_KEY, { year: anio, lastNumber: numero })

  return formatBudgetNumber(anio, numero)
}
