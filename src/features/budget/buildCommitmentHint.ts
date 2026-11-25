import {
  COMMITMENT_DISCOUNT_MIN_MONTHS,
  COMMITMENT_DISCOUNT_PERCENT,
} from '../../shared/constants/business-rules'
import { qualifiesForCommitmentDiscount } from '../../shared/strategies/commitmentDiscount'
import type { BudgetLine } from '../../shared/types/budget'
import { isMonthlyLine } from '../../shared/utils/isMonthlyLine'

/** Lo que se lee cuando la línea ya tiene el descuento. */
const PISTA_APLICADO = 'Descuento por permanencia aplicado'

/** Lo que se lee cuando todavía no llega, construido con las constantes. */
const PISTA_PENDIENTE = `Desde ${COMMITMENT_DISCOUNT_MIN_MONTHS} meses: ${COMMITMENT_DISCOUNT_PERCENT} % de descuento`

/**
 * La pista que acompaña al selector de meses de una línea mensual, o `null` si
 * la línea no tiene meses.
 *
 * ## Por qué existe
 *
 * Es el pendiente nº 18 de PROGRESO.md, y lo pidió el usuario después de probar
 * la Fase 5: **nada en pantalla explicaba para qué sirven los meses**. Cambiar
 * el selector no movía ningún importe —la cuota es la de un mes, y eso es
 * correcto—, así que el campo parecía no hacer nada. Desde la Fase 6 sí hace
 * algo, y la pista lo dice antes de que haya que descubrirlo a base de probar:
 * «Desde 12 meses: 10 % de descuento» invita, y «Descuento por permanencia
 * aplicado» confirma.
 *
 * ## Por qué no compara los meses por su cuenta
 *
 * Porque entonces la pantalla y el cálculo tendrían **dos** versiones de la
 * misma regla. La condición sale de `qualifiesForCommitmentDiscount`, la misma
 * función que usa la estrategia que concede el descuento, así que la pista no
 * puede decir «aplicado» en un presupuesto que no lo lleva. Hay un test que
 * recorre todos los meses posibles comprobando que las dos coinciden.
 *
 * Esto **no es calcular en un componente** (pendiente nº 12): la función no
 * produce ningún importe, y el componente que la usa solo muestra el texto que
 * recibe.
 */
export function buildCommitmentHint(line: BudgetLine): string | null {
  if (!isMonthlyLine(line)) {
    return null
  }

  return qualifiesForCommitmentDiscount(line) ? PISTA_APLICADO : PISTA_PENDIENTE
}
