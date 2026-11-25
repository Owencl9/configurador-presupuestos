import { describe, expect, it } from 'vitest'

import { MAX_BUDGET_COUNTER } from './budgetCounterFormat'
import { parseBudgetCounter } from './parseBudgetCounter'

/*
 * Esta función es la frontera del contador: todo lo que entra viene de
 * `localStorage` y por tanto es `unknown`. Cualquiera puede abrir las
 * herramientas del navegador y escribir ahí lo que quiera.
 *
 * ## La decisión de qué se hace con un dato dañado
 *
 * En la Fase 5, el borrador trata los datos malos de tres formas distintas
 * (ADR 0009): la estructura se descarta entera, una línea suelta se descarta
 * sola y un número fuera de rango se normaliza. Aquí **todo se descarta
 * entero**, y es una decisión, no un descuido: no hay nada que normalizar.
 *
 * Si el contador está dañado, el valor correcto es inaverigable —nadie sabe
 * cuántos presupuestos se emitieron—, así que la única salida es empezar una
 * serie nueva. Y descartar el contador tiene exactamente ese efecto: el
 * siguiente presupuesto será el `0001` del año en curso. No hay una opción
 * mejor, así que se elige la predecible.
 */
describe('parseBudgetCounter', () => {
  it('acepta un contador bien formado', () => {
    expect(parseBudgetCounter({ year: 2026, lastNumber: 3 })).toEqual({
      year: 2026,
      lastNumber: 3,
    })
  })

  it('acepta el último número en cero, que es una serie recién creada', () => {
    // `lastNumber` es el último número **repartido**, no el siguiente. Una
    // serie en la que todavía no se ha emitido nada vale 0, y es válida.
    expect(parseBudgetCounter({ year: 2026, lastNumber: 0 })).toEqual({
      year: 2026,
      lastNumber: 0,
    })
  })

  it.each([
    ['nada', null],
    ['indefinido', undefined],
    ['un texto', 'PRE-2026-0001'],
    ['un número', 7],
    ['un booleano', true],
    ['un array', [{ year: 2026, lastNumber: 1 }]],
  ])('descarta %s', (_descripcion, valor) => {
    /*
     * El array está en la lista por un motivo concreto: en JavaScript,
     * `typeof [] === 'object'`, así que una comprobación escrita solo con
     * `typeof` lo aceptaría como objeto y después leería `undefined` en los dos
     * campos. Es el mismo caso que ya vigila `parseDraft` en la Fase 5.
     */
    expect(parseBudgetCounter(valor)).toBeNull()
  })

  it('descarta un objeto sin los campos que hacen falta', () => {
    expect(parseBudgetCounter({})).toBeNull()
    expect(parseBudgetCounter({ year: 2026 })).toBeNull()
    expect(parseBudgetCounter({ lastNumber: 3 })).toBeNull()
  })

  it.each([
    ['de tres cifras', 999],
    ['de cinco cifras', 10_000],
    ['con decimales', 2026.5],
    ['como texto', '2026'],
    ['como NaN', Number.NaN],
    ['infinito', Number.POSITIVE_INFINITY],
    ['negativo', -2026],
  ])('descarta el contador con un año %s', (_descripcion, year) => {
    // El año no se normaliza: es lo que identifica la serie, y acercarlo al
    // valor más próximo significaría inventarse a qué año pertenecen los
    // números ya repartidos.
    expect(parseBudgetCounter({ year, lastNumber: 3 })).toBeNull()
  })

  it.each([
    ['negativo', -1],
    ['con decimales', 3.5],
    ['como texto', '3'],
    ['como NaN', Number.NaN],
    ['infinito', Number.POSITIVE_INFINITY],
    ['nulo', null],
  ])(
    'descarta el contador con un último número %s',
    (_descripcion, lastNumber) => {
      expect(parseBudgetCounter({ year: 2026, lastNumber })).toBeNull()
    },
  )

  it('acepta el último número justo en el tope', () => {
    expect(
      parseBudgetCounter({ year: 2026, lastNumber: MAX_BUDGET_COUNTER }),
    ).toEqual({ year: 2026, lastNumber: MAX_BUDGET_COUNTER })
  })

  it('descarta un último número por encima del tope', () => {
    /*
     * **El test que justifica que exista un tope.** Un número enorme pasa
     * `Number.isInteger` —`Number.isInteger(1e21)` es `true`— y se convierte a
     * texto en notación exponencial: `String(1e21)` es `'1e+21'`. Sin este
     * límite, un contador manipulado a mano en el navegador acabaría impreso
     * como `PRE-2026-1e+21` en el documento de un cliente.
     *
     * Es el mismo tipo de hallazgo que el de la Fase 2 con los precios
     * minificados: JavaScript escribe los números grandes en una forma que nadie
     * espera leer.
     */
    expect(
      parseBudgetCounter({ year: 2026, lastNumber: MAX_BUDGET_COUNTER + 1 }),
    ).toBeNull()
    expect(parseBudgetCounter({ year: 2026, lastNumber: 1e21 })).toBeNull()
  })

  it('ignora los campos que no conoce y conserva los dos que sí', () => {
    /*
     * Un campo sobrante no es motivo para tirar el contador: puede venir de una
     * versión futura o de alguien curioseando. Lo que sí importa es que **no se
     * copie**: el objeto que sale de aquí es el que usará el resto de la
     * aplicación, y tiene que tener exactamente dos campos.
     */
    const parseado = parseBudgetCounter({
      year: 2026,
      lastNumber: 3,
      nombreDelCliente: 'esto no debería existir',
    })

    expect(parseado).toEqual({ year: 2026, lastNumber: 3 })
    expect(parseado).not.toHaveProperty('nombreDelCliente')
  })

  it('devuelve un objeto nuevo y no el que ha recibido', () => {
    // Si devolviera el mismo objeto, la aplicación se quedaría con una
    // referencia a un dato que viene de fuera. `toBe` compara identidad.
    const leido = { year: 2026, lastNumber: 3 }

    expect(parseBudgetCounter(leido)).not.toBe(leido)
  })
})
