/* =============================================================================
 * FORMATO DEL CONTADOR DE NÚMEROS DE PRESUPUESTO
 * =============================================================================
 *
 * **Este archivo define qué se guarda y bajo qué clave, y es el único sitio
 * donde se cambia.** `parseBudgetCounter` valida esta forma y
 * `budgetNumberStorage` la lleva y la trae de `localStorage`.
 *
 * Es el mismo reparto en cuatro piezas que el borrador de la Fase 5
 * (`draftFormat`, `serializeDraft`, `parseDraft`, `draftStorage`) y por el mismo
 * motivo: así la función que valida es **pura** y no importa nada que toque el
 * navegador. La dependencia va del lado que tiene efectos al lado que no los
 * tiene, nunca al contrario.
 *
 * ## Qué se guarda: dos enteros
 *
 * El año de la serie y el último número repartido. **Ningún dato personal.** El
 * nombre, la empresa y el correo del cliente no se guardan en ninguna parte
 * (ADR 0013): se escriben, se imprimen y se olvidan al recargar.
 *
 * ## Cada navegador lleva su propia numeración
 *
 * No hay servidor (ADR 0002), así que el contador vive en el navegador de quien
 * usa la aplicación. Dos personas que abran la aplicación por primera vez
 * recibirán las dos un `PRE-2026-0001`. Es una consecuencia conocida y
 * aceptada, razonada en el ADR 0012, y se avisa de ella en la pantalla y en el
 * README. **No se imprime en el documento**: un cliente no tiene por qué leer
 * que su número puede estar repetido.
 * ========================================================================== */

/**
 * Clave del contador en `localStorage`, **con la versión del formato dentro**.
 *
 * Misma decisión que la clave del borrador en la Fase 5: si el formato cambia,
 * la clave pasa a `:v2` y lo escrito con el formato viejo queda ignorado sin
 * llegar a interpretarse. Y es una clave **distinta** de la del borrador a
 * propósito: el borrador se borra al pulsar «Empezar de nuevo» y el contador
 * no, porque el siguiente presupuesto tiene que recibir un número nuevo y no
 * repetir el anterior.
 */
export const BUDGET_COUNTER_STORAGE_KEY =
  'configurador-presupuestos:budget-counter:v1'

/**
 * Tope del contador.
 *
 * No es una regla de negocio: es una defensa contra un valor manipulado a mano
 * en el almacenamiento del navegador. Un número enorme pasa `Number.isInteger`
 * —`Number.isInteger(1e21)` es `true`— y **se escribe en notación
 * exponencial**: `String(1e21)` devuelve `'1e+21'`, así que el documento de un
 * cliente llevaría impreso `PRE-2026-1e+21`. Por encima de este tope el
 * contador se considera dañado y la serie empieza de nuevo.
 *
 * Seis cifras son inalcanzables en un uso real: son cien mil presupuestos
 * emitidos desde el mismo navegador.
 */
export const MAX_BUDGET_COUNTER = 999_999

/**
 * El contador, tal y como se guarda.
 *
 * **Describe lo que escribimos, no lo que leemos.** Lo que vuelve de
 * `localStorage` es `unknown` hasta que `parseBudgetCounter` lo valide: un tipo
 * de TypeScript desaparece al compilar y no comprueba nada en tiempo de
 * ejecución, así que declarar que lo leído es un `StoredBudgetCounter` sería una
 * promesa que nadie verifica.
 *
 * `lastNumber` es el **último número repartido**, no el siguiente. Vale 0 en una
 * serie recién creada, cuando todavía no se ha emitido ningún presupuesto.
 */
export interface StoredBudgetCounter {
  readonly year: number
  readonly lastNumber: number
}
