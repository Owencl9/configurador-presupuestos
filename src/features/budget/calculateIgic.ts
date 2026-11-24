/**
 * Calcula el IGIC de una base imponible y lo devuelve **redondeado a céntimos
 * enteros**.
 *
 * Las tres decisiones que hay en esta única línea están razonadas en
 * [ADR 0007](../../../docs/adr/0007-redondeo-del-igic.md). En resumen:
 *
 * 1. **Multiplicar por el porcentaje entero y dividir al final.** `base * 7`
 *    es un producto exacto; `base * 0.07` no, porque 0,07 no tiene
 *    representación binaria exacta (vale 0,070000000000000006…). Las dos
 *    fórmulas coinciden en todos los importes que maneja la aplicación —se
 *    comprobó sobre dos millones de bases—, pero esta deja el valor intermedio
 *    en el número matemático exacto, así que el redondeo lo decide la regla y
 *    no un error que casualmente apunta en la buena dirección.
 *
 * 2. **Redondeo comercial: al más cercano, y el empate hacia arriba.** Es lo
 *    que hace `Math.round` y lo que haría cualquiera comprobando la factura con
 *    una calculadora. La alternativa, el redondeo bancario (empates al par),
 *    existe para evitar el sesgo de acumular millones de redondeos; aquí hay
 *    tres por presupuesto y daría un resultado que sorprendería al cliente.
 *
 * 3. **Un único redondeo, sobre la base completa.** Nunca línea a línea: la
 *    suma de redondeos no es el redondeo de la suma, y el desglose impreso solo
 *    muestra base, IGIC y total del bloque, así que no hay nada que cuadrar por
 *    línea. Quien garantiza que esto se cumple es `calculateBudget`, que llama
 *    a esta función una sola vez por forma de pago.
 *
 * Aviso para quien reutilice la función: `Math.round(-3.5)` devuelve `-3`, no
 * `-4`; redondea hacia el infinito positivo, no alejándose del cero. No afecta
 * al presupuesto, porque la base imponible nunca es negativa —los descuentos se
 * restan antes y el tope del 20 % impide que superen al subtotal—, pero el
 * comportamiento no es simétrico y conviene saberlo.
 *
 * @param baseCents Base imponible en céntimos enteros, ya con los descuentos
 *   restados. Es un entero por construcción: `calculateSubtotals` solo
 *   multiplica y suma enteros.
 * @param ratePercent Tipo en porcentaje (7 para el 7 %), no en factor. Se pasa
 *   por parámetro en lugar de leerlo de las constantes para que la función sea
 *   pura y se pueda probar con tipos que hoy no están configurados. El valor
 *   real sale de `IGIC_RATE_PERCENT` y lo pasa `calculateBudget`.
 */
export function calculateIgic(baseCents: number, ratePercent: number): number {
  return Math.round((baseCents * ratePercent) / 100)
}
