/* =============================================================================
 * REGLAS DE NEGOCIO DEL PRESUPUESTO
 * =============================================================================
 *
 * **Este es el único archivo del proyecto donde se cambian estos valores.** Lo
 * exige el apartado 4.3 del prompt maestro y el apartado 3 de CLAUDE.md: ni el
 * cálculo, ni los componentes, ni los tests de lógica repiten un porcentaje o
 * un umbral. Si un número de los de abajo aparece escrito a mano en otro
 * archivo, es un error.
 *
 * Todos los importes están **en céntimos** y todos los porcentajes son
 * **números, no factores**: el 7 % se escribe `7`, no `0.07`. Así la aritmética
 * se mantiene en enteros (ADR 0003) y el valor se lee igual que se dice.
 *
 * Los valores son los confirmados por el usuario al abrir la Fase 3. Los
 * precios de los servicios no están aquí: viven en `shared/data/services.ts`,
 * porque son datos del catálogo y no reglas.
 * ========================================================================== */

/**
 * Tipo de IGIC aplicado a la base imponible, en porcentaje.
 *
 * El IGIC es el impuesto indirecto de Canarias, el equivalente al IVA. El 7 %
 * es el tipo general. **Es configurable: cambiar este número cambia todo el
 * cálculo**, y no hay ningún otro sitio que haya que tocar.
 *
 * Admite tipos con medio punto —el 9,5 % de uno de los tipos incrementados
 * funciona exacto—, pero no décimas sueltas como un 7,1 %. El motivo está en
 * [ADR 0007](../../../docs/adr/0007-redondeo-del-igic.md): los medios tienen
 * representación binaria exacta y las décimas no, y hay un test que vigila esta
 * condición en `business-rules.test.ts`.
 */
export const IGIC_RATE_PERCENT = 7

/* -----------------------------------------------------------------------------
 * Descuentos
 *
 * Los tres descuentos y su tope están **registrados pero no implementados**.
 * Son la Fase 6, con el patrón Strategy
 * ([ADR 0004](../../../docs/adr/0004-strategy-para-descuentos.md)): una
 * estrategia por regla y un calculador que las combina y aplica el tope.
 *
 * Están aquí desde la Fase 3 por una razón práctica: así la regla y su valor
 * nacen en el mismo sitio, y la Fase 6 implementa comportamiento sin tener que
 * decidir además cuánto vale cada cosa.
 * -------------------------------------------------------------------------- */

/** Servicios **distintos** que debe haber en el presupuesto para que sea un pack. */
export const PACK_DISCOUNT_MIN_SERVICES = 3

/** Descuento por pack, en porcentaje sobre el subtotal. */
export const PACK_DISCOUNT_PERCENT = 5

/** Meses de contratación a partir de los cuales hay descuento por permanencia. */
export const COMMITMENT_DISCOUNT_MIN_MONTHS = 12

/** Descuento por permanencia, en porcentaje sobre los servicios mensuales afectados. */
export const COMMITMENT_DISCOUNT_PERCENT = 10

/**
 * Importe de pago único a partir del cual hay descuento por volumen, en
 * céntimos. Son 3.000 €, y la comparación es **estrictamente mayor**: un pago
 * único de exactamente 3.000 € no lo activa.
 */
export const AMOUNT_DISCOUNT_THRESHOLD_CENTS = 300_000

/** Descuento por importe, en porcentaje sobre el pago único. */
export const AMOUNT_DISCOUNT_PERCENT = 5

/**
 * Tope del descuento total, en porcentaje.
 *
 * Los descuentos pueden acumularse, pero nunca por encima de este límite. Es la
 * última regla que aplica el calculador de la Fase 6, después de sumar las
 * estrategias.
 */
export const MAX_TOTAL_DISCOUNT_PERCENT = 20
