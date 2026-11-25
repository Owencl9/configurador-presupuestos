import type { BudgetLine, MonthlyBudgetLine } from '../types/budget'

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
 *
 * ## Por qué vive en `shared/utils/`
 *
 * Nació en `features/budget/` en la Fase 4, cuando solo la usaba la línea del
 * presupuesto. En la Fase 5 pasó a usarla también el reducer, y en la Fase 6, la
 * estrategia de permanencia, que vive en `shared/strategies/`. Son tres zonas
 * distintas, y una carpeta de `shared/` no puede depender de una
 * funcionalidad: es el apartado 6 de `CLAUDE.md`, y el mismo camino que
 * recorrió `buildAmountLabel` en la Fase 4. **El cuerpo de la función no ha
 * cambiado al mudarse, ni sus tests.**
 */
export function isMonthlyLine(line: BudgetLine): line is MonthlyBudgetLine {
  return line.service.payment === 'monthly'
}
