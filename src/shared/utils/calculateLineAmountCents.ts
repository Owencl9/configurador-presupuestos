import type { BudgetLine } from '../types/budget'

/**
 * Importe de una línea del presupuesto, en céntimos: el precio del servicio por
 * la cantidad contratada.
 *
 * **Es la única multiplicación de precio por cantidad del proyecto.** La hacía
 * `calculateSubtotals` por su cuenta desde la Fase 3, y desde la Fase 4 la línea
 * del presupuesto necesita mostrar ese mismo importe en pantalla. Dos sitios
 * multiplicando lo mismo es la forma habitual de que un día dejen de coincidir:
 * basta con que uno de los dos aprenda a redondear, a aplicar un descuento o a
 * contar los meses y el otro no.
 *
 * **Los meses no intervienen.** En una línea mensual el resultado es la cuota de
 * **un** mes por la cantidad, no el total de la permanencia, igual que
 * `monthlyCents` en la Fase 3. El total comprometido es otra cifra, no está en
 * la especificación de esta fase y, si alguna vez se muestra, será otra función
 * con otro nombre.
 *
 * No valida nada: recibe una línea ya correcta. Mantener la cantidad dentro de
 * su mínimo y su máximo es trabajo de `normalizeNumber`, que es quien trata con
 * lo que escribe una persona o con lo que aparece en un borrador guardado.
 *
 * ## Por qué vive en `shared/utils/`
 *
 * Nació en `features/budget/` en la Fase 4, con dos usos dentro de esa misma
 * funcionalidad. En la Fase 6 la necesita además la estrategia de permanencia,
 * que vive en `shared/strategies/` y tiene que sumar el importe de las líneas
 * mensuales de doce meses o más. Una carpeta de `shared/` no puede depender de
 * una funcionalidad (apartado 6 de `CLAUDE.md`), y la alternativa era peor:
 * duplicar precisamente la multiplicación que esta función existe para no
 * duplicar. **El cuerpo no ha cambiado al mudarse, ni sus tests.**
 */
export function calculateLineAmountCents(line: BudgetLine): number {
  return line.service.priceCents * line.quantity
}
