import type { BudgetLine } from '../../shared/types/budget'
import type { StoredDraft, StoredDraftLine } from './draftFormat'
import { isMonthlyLine } from './isMonthlyLine'

/**
 * Convierte las líneas del presupuesto en el borrador que se guarda.
 *
 * Función pura: no toca `localStorage` ni convierte a JSON. Solo decide **qué**
 * se guarda, que es la parte que importa y la que se puede probar sin
 * navegador. El resto lo hace `draftStorage`.
 *
 * Es la cara opuesta de `parseDraft`, y las dos juntas son el único sitio donde
 * la aplicación y el navegador se hablan: de aquí sale lo mínimo —identificador,
 * cantidad y meses— y allí se valida todo lo que entra.
 */
export function serializeDraft(lines: readonly BudgetLine[]): StoredDraft {
  return {
    lines: lines.map((linea): StoredDraftLine => {
      /*
       * Los meses se escriben solo en las líneas mensuales, y la comprobación
       * pasa por `isMonthlyLine` porque el discriminante de `BudgetLine` está
       * anidado en `service` (ver `shared/types/budget.ts`). Escribir un
       * `months` en una línea anual no haría daño a ningún importe, pero sería
       * un dato que la aplicación no sabe producir y que el borrador afirma.
       */
      if (isMonthlyLine(linea)) {
        return {
          serviceId: linea.service.id,
          quantity: linea.quantity,
          months: linea.months,
        }
      }

      return { serviceId: linea.service.id, quantity: linea.quantity }
    }),
  }
}
