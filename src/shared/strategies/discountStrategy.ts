/**
 * La forma de una estrategia de descuento.
 *
 * Solo tipos y una lista de claves: ni cálculos ni valores de negocio. Los
 * valores están en `shared/constants/business-rules.ts` y cada regla, en su
 * propio archivo de esta carpeta.
 *
 * El patrón Strategy de este proyecto está decidido y razonado en
 * [ADR 0004](../../../docs/adr/0004-strategy-para-descuentos.md), y cómo se
 * combinan las reglas, en
 * [ADR 0010](../../../docs/adr/0010-como-se-aplican-los-descuentos.md).
 */

import type { AppliedDiscount, Budget, BudgetLine } from '../types/budget'

/**
 * Cuál de los tres bloques de pago.
 *
 * Es `keyof Budget` y no una unión escrita a mano a propósito: si algún día el
 * presupuesto tuviera un bloque más, esta clave lo incluiría sola y el
 * compilador señalaría los sitios que no lo tratan.
 */
export type PaymentBlockKey = keyof Budget

/**
 * Los tres bloques, en el orden en que se presentan.
 *
 * Lo usa el calculador para recorrerlos. El tipo obliga a que sean claves de
 * `Budget`, pero **no** a que estén las tres: de que no falte ninguna se
 * encarga el tipo `Record<PaymentBlockKey, number>` de los subtotales del
 * contexto, que no se puede construir dejándose un bloque.
 */
export const PAYMENT_BLOCK_KEYS: readonly PaymentBlockKey[] = [
  'oneTime',
  'monthly',
  'yearly',
]

/**
 * Lo que recibe una estrategia para decidir.
 *
 * Son las líneas y los subtotales **antes de cualquier descuento**, que es
 * sobre lo que se evalúan todas las condiciones (apartado 2 del
 * [ADR 0010](../../../docs/adr/0010-como-se-aplican-los-descuentos.md)): si una
 * regla pudiera mirar el resultado de otra, el descuento dependería del orden
 * de ejecución y dejaría de ser una suma.
 */
export interface DiscountContext {
  /** Las líneas del presupuesto, tal cual. */
  readonly lines: readonly BudgetLine[]
  /**
   * El subtotal de cada bloque, antes de descuentos.
   *
   * Es un `Record` con las tres claves obligatorias, y no el tipo `Subtotals`,
   * para que una estrategia pueda escribir `subtotalsCents[bloque]` sin
   * traducir nombres. La traducción ocurre una sola vez, en
   * `calculateDiscounts`.
   */
  readonly subtotalsCents: Readonly<Record<PaymentBlockKey, number>>
}

/** Un descuento ya decidido, con el bloque al que se aplica. */
export interface BlockDiscount extends AppliedDiscount {
  readonly block: PaymentBlockKey
}

/**
 * Una estrategia de descuento: recibe el contexto y devuelve los descuentos
 * que le corresponden, cada uno con su bloque, su importe y su motivo.
 *
 * Dos condiciones que cumplen las tres estrategias del proyecto y que debe
 * cumplir cualquiera que se añada:
 *
 * 1. **Una regla que no se cumple devuelve una lista vacía**, no un descuento
 *    de cero céntimos. Un cero acabaría como una fila «0,00 €» en el resumen.
 * 2. **Una estrategia no conoce a las demás.** No ve lo que han descontado
 *    otras ni en qué orden se ejecutan. De sumar los resultados y de aplicar el
 *    tope se encarga `calculateDiscounts`.
 *
 * Es una función y no una clase: no hay estado que guardar entre llamadas, y
 * una función pura se prueba pasándole un objeto y comparando lo que devuelve.
 */
export type DiscountStrategy = (
  context: DiscountContext,
) => readonly BlockDiscount[]
