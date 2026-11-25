import {
  MAX_BUDGET_COUNTER,
  type StoredBudgetCounter,
} from './budgetCounterFormat'

/**
 * Valida el contador leído del navegador. **Función pura.**
 *
 * Recibe `unknown` porque es exactamente lo que devuelve `localStorage`: no hay
 * ninguna garantía de que ahí haya lo que escribimos la última vez. Cualquiera
 * puede abrir las herramientas del navegador y escribir otra cosa.
 *
 * ## Todo o nada, y por qué aquí sí
 *
 * El borrador de la Fase 5 trata los datos dañados de tres formas distintas
 * (ADR 0009): descarta la estructura entera, descarta una línea suelta o
 * normaliza un número fuera de rango. **Aquí se descarta todo**, y es una
 * decisión razonada: no hay nada que normalizar.
 *
 * Un contador dañado no tiene valor correcto averiguable —nadie sabe cuántos
 * presupuestos se emitieron antes—, así que la única salida posible es empezar
 * una serie nueva, que es justo lo que ocurre al descartarlo: el siguiente
 * presupuesto será el `0001` del año en curso. Normalizar un `lastNumber: -5`
 * a 0 daría el mismo resultado con más código.
 *
 * @returns El contador válido, o `null` si no se puede usar lo que había.
 */
export function parseBudgetCounter(raw: unknown): StoredBudgetCounter | null {
  /*
   * `typeof [] === 'object'` y `typeof null === 'object'` en JavaScript, así que
   * una comprobación escrita solo con `typeof` aceptaría los dos y después
   * leería `undefined` en los dos campos. Hay un test para cada uno.
   */
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null
  }

  const { year, lastNumber } = raw as Record<string, unknown>

  // Cuatro cifras exactas, igual que exige `formatBudgetNumber`. El año
  // identifica la serie y no se normaliza: acercarlo al valor más próximo
  // sería inventarse a qué año pertenecen los números ya repartidos.
  if (typeof year !== 'number' || !Number.isInteger(year)) return null
  if (year < 1000 || year > 9999) return null

  if (typeof lastNumber !== 'number' || !Number.isInteger(lastNumber)) {
    return null
  }
  // Cero es válido: una serie recién creada en la que todavía no se ha emitido
  // nada. El tope superior está explicado en `budgetCounterFormat.ts`: por
  // encima, `String()` escribiría el número en notación exponencial y acabaría
  // impreso como `PRE-2026-1e+21`.
  if (lastNumber < 0 || lastNumber > MAX_BUDGET_COUNTER) return null

  // Un objeto nuevo con exactamente dos campos. Devolver `raw` dejaría a la
  // aplicación con una referencia a un dato de fuera y con los campos
  // sobrantes que trajera.
  return { year, lastNumber }
}
