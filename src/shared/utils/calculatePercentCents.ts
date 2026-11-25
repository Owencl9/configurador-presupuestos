/**
 * Calcula un porcentaje de un importe en céntimos y lo devuelve **redondeado a
 * céntimos enteros**.
 *
 * Es el **único sitio del proyecto que calcula un porcentaje de dinero**. Lo
 * usan `calculateIgic` y las tres estrategias de descuento de la Fase 6, así
 * que la regla de redondeo del presupuesto se decide aquí y no en cuatro
 * sitios que podrían discrepar. Es el mismo movimiento que hizo la Fase 4 con
 * `calculateLineAmountCents`, que extrajo la única multiplicación del
 * proyecto cuando apareció el segundo sitio que la necesitaba.
 *
 * Las tres decisiones que encierra esta única línea están razonadas en
 * [ADR 0007](../../../docs/adr/0007-redondeo-del-igic.md), escrito para el
 * IGIC y válido tal cual para los descuentos:
 *
 * 1. **Multiplicar por el porcentaje entero y dividir al final.** `base * 7` es
 *    un producto exacto; `base * 0.07` no, porque 0,07 no tiene representación
 *    binaria exacta (vale 0,070000000000000006…). Así el valor intermedio es el
 *    número matemático exacto y el redondeo lo decide la regla de negocio, no
 *    un error de representación que casualmente apunta en la buena dirección.
 *
 * 2. **Redondeo comercial: al más cercano, y el empate hacia arriba.** Es lo que
 *    hace `Math.round` y lo que haría cualquiera comprobando una factura con
 *    una calculadora.
 *
 * 3. **Un único redondeo por importe calculado.** Quien garantiza que no se
 *    redondea dos veces lo mismo son los llamadores: `calculateBudget` pide el
 *    IGIC una sola vez por bloque, y el calculador de descuentos pide cada
 *    descuento una sola vez por bloque.
 *
 * Aviso para quien la reutilice: `Math.round(-3.5)` devuelve `-3`, no `-4`;
 * redondea hacia el infinito positivo, no alejándose del cero. No afecta al
 * presupuesto, donde ni las bases ni los descuentos son negativos, pero el
 * comportamiento no es simétrico y conviene saberlo.
 *
 * @param baseCents Importe en céntimos enteros sobre el que se calcula.
 * @param percent Porcentaje como número, no como factor: el 7 % es `7`, no
 *   `0.07`. Es el formato en el que están las reglas en
 *   `shared/constants/business-rules.ts`.
 */
export function calculatePercentCents(
  baseCents: number,
  percent: number,
): number {
  return Math.round((baseCents * percent) / 100)
}
