import { MAX_TOTAL_DISCOUNT_PERCENT } from '../constants/business-rules'
import type { AppliedDiscount, BudgetLine, Subtotals } from '../types/budget'
import { amountDiscount } from './amountDiscount'
import { commitmentDiscount } from './commitmentDiscount'
import type {
  DiscountContext,
  DiscountStrategy,
  PaymentBlockKey,
} from './discountStrategy'
import { PAYMENT_BLOCK_KEYS } from './discountStrategy'
import { packDiscount } from './packDiscount'

/**
 * Las tres estrategias del proyecto, en el orden en que se presentan sus
 * descuentos en el resumen.
 *
 * **Añadir una regla de descuento es añadir un archivo y registrarlo aquí**, sin
 * tocar ninguna de las demás ni el calculador. Es la ventaja concreta por la
 * que se eligió el patrón Strategy
 * ([ADR 0004](../../../docs/adr/0004-strategy-para-descuentos.md)).
 *
 * El orden no cambia ningún importe —los descuentos se suman, no se encadenan—,
 * solo el orden de las filas del desglose.
 */
export const DISCOUNT_STRATEGIES: readonly DiscountStrategy[] = [
  packDiscount,
  commitmentDiscount,
  amountDiscount,
]

/** El motivo del ajuste por tope, construido con la constante. */
const MOTIVO_TOPE = `Tope del ${MAX_TOTAL_DISCOUNT_PERCENT} % del subtotal`

/**
 * Suma los importes de una lista de descuentos.
 *
 * Existe para que el descuento de un bloque **sea por construcción la suma de
 * sus motivos**: `calculateBudget` no suma por su cuenta, llama aquí. Así no
 * puede ocurrir que el resumen muestre tres filas que no cuadran con el
 * importe restado.
 *
 * Cuenta el ajuste del tope, que es negativo, con su signo.
 */
export function sumDiscountCents(
  discounts: readonly AppliedDiscount[],
): number {
  return discounts.reduce((total, { amountCents }) => total + amountCents, 0)
}

/**
 * El descuento máximo admitido para un subtotal, en céntimos.
 *
 * **Se trunca hacia abajo, y es la única operación del proyecto que no usa el
 * redondeo comercial.** El 20 % de 9,99 € son 1,998 €: redondeando daría
 * 2,00 €, que es más del 20 % del subtotal. Un tope que se puede superar no es
 * un tope, así que aquí se corta la parte decimal en lugar de aproximarla.
 */
function maxDiscountCents(subtotalCents: number): number {
  return Math.floor((subtotalCents * MAX_TOTAL_DISCOUNT_PERCENT) / 100)
}

/**
 * Calcula los descuentos de cada bloque de pago: ejecuta las estrategias, suma
 * lo que cae en el mismo bloque y aplica el tope.
 *
 * Devuelve, por bloque, la lista de descuentos **con su motivo**, en el orden
 * en que se muestran. El importe total de cada bloque no se devuelve aparte: es
 * la suma de su lista, y la calcula `sumDiscountCents`.
 *
 * ## El orden de cálculo, y por qué es así
 *
 * 1. **Las condiciones se evalúan sobre los subtotales sin descontar.** Todas,
 *    y antes de aplicar ninguna rebaja. Si una regla pudiera mirar el resultado
 *    de otra, el descuento dependería del orden de ejecución de las
 *    estrategias: un presupuesto de 3.100 € al que el pack le quita 155 €
 *    dejaría de superar los 3.000 € del descuento por importe, y el resultado
 *    sería distinto según cuál se ejecutara primero.
 * 2. **Los descuentos de un bloque se suman.** No se encadenan: los dos
 *    porcentajes se calculan sobre el subtotal. En la cuota mensual, un 5 % de
 *    pack y un 10 % de permanencia son el 15 % del subtotal, no un 14,5 %.
 * 3. **El tope se aplica al final y por bloque.** No es una estrategia, es una
 *    restricción sobre el resultado: mezclarlo con las demás lo haría depender
 *    del orden (ADR 0004).
 *
 * Todo esto está razonado en
 * [ADR 0010](../../../docs/adr/0010-como-se-aplican-los-descuentos.md).
 *
 * ## El ajuste del tope
 *
 * Cuando el tope recorta, **los descuentos conservan su importe** y se añade una
 * fila de ajuste con importe **negativo**. Decisión del usuario, y tiene dos
 * consecuencias buenas: ninguna etiqueta miente —un «5 %» sigue valiendo el
 * 5 % del subtotal— y la suma de lo que se muestra es exactamente lo que se
 * resta. La alternativa era repartir el recorte entre los descuentos, y
 * entonces la fila «Pack (5 %)» mostraría un importe que no es el 5 %.
 *
 * Con las reglas actuales el ajuste **no aparece nunca**: lo máximo que se
 * junta en un bloque es el 15 % de la cuota mensual. Está programado y probado
 * con estrategias de prueba, y hay un test que vigila que siga siendo
 * inalcanzable en producción.
 *
 * @param lines Las líneas del presupuesto.
 * @param subtotals Los tres subtotales **antes de descuentos**, tal como los
 *   devuelve `calculateSubtotals`.
 * @param strategies Las estrategias que se aplican. Por defecto, las tres del
 *   proyecto. Se puede indicar otra lista, y es lo que permite probar el tope
 *   del 20 % sin cambiar ninguna regla real, igual que `calculateBudget` admite
 *   un tipo de IGIC distinto del configurado.
 */
export function calculateDiscounts(
  lines: readonly BudgetLine[],
  subtotals: Subtotals,
  strategies: readonly DiscountStrategy[] = DISCOUNT_STRATEGIES,
): Readonly<Record<PaymentBlockKey, readonly AppliedDiscount[]>> {
  /*
   * La única traducción entre los nombres de `Subtotals` y las claves de los
   * bloques. El tipo `Record<PaymentBlockKey, number>` obliga a que estén las
   * tres: dejarse una no compila.
   */
  const subtotalsCents: Record<PaymentBlockKey, number> = {
    oneTime: subtotals.oneTimeCents,
    monthly: subtotals.monthlyCents,
    yearly: subtotals.yearlyCents,
  }

  const context: DiscountContext = { lines, subtotalsCents }

  const porBloque: Record<PaymentBlockKey, AppliedDiscount[]> = {
    oneTime: [],
    monthly: [],
    yearly: [],
  }

  for (const strategy of strategies) {
    for (const { block, id, label, amountCents } of strategy(context)) {
      if (amountCents > 0) {
        /*
         * El bloque se queda fuera del descuento: es la clave de la lista, y
         * repetirlo dentro sería el mismo dato en dos sitios que podrían
         * contradecirse.
         */
        porBloque[block].push({ id, label, amountCents })
      }
    }
  }

  for (const block of PAYMENT_BLOCK_KEYS) {
    const descuentos = porBloque[block]
    const maximoCents = maxDiscountCents(subtotalsCents[block])
    const sumaCents = sumDiscountCents(descuentos)

    if (sumaCents > maximoCents) {
      descuentos.push({
        id: 'cap',
        label: MOTIVO_TOPE,
        amountCents: maximoCents - sumaCents,
      })
    }
  }

  return porBloque
}
