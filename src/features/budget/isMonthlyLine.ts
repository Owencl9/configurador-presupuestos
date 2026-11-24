import type { BudgetLine, MonthlyBudgetLine } from '../../shared/types/budget'

/**
 * Indica si una línea del presupuesto es de un servicio mensual y, por tanto,
 * tiene meses de contratación.
 *
 * No es una comprobación cualquiera: el `line is MonthlyBudgetLine` del tipo de
 * retorno es un **predicado de tipo**, y es lo que hace falta aquí. Dentro de un
 * `if (isMonthlyLine(linea))`, TypeScript sabe que la línea es mensual y deja
 * leer `linea.months` como `number`; fuera, no.
 *
 * Hace falta una función para esto —y no basta con escribir
 * `linea.service.payment === 'monthly'` en el sitio donde se necesite— porque el
 * discriminante de `BudgetLine` está **anidado** dentro de `service`.
 * TypeScript estrecha una unión mirando un campo propio del objeto, no uno de
 * su campo, así que la comparación escrita a mano comprueba el dato pero no
 * informa al compilador. El predicado sí.
 *
 * Es la contrapartida de la decisión de la unión discriminada: se gana que los
 * datos imposibles no compilen y se paga con esta función de una línea.
 */
export function isMonthlyLine(line: BudgetLine): line is MonthlyBudgetLine {
  return line.service.payment === 'monthly'
}
