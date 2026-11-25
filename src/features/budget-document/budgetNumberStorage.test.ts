import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  BUDGET_COUNTER_STORAGE_KEY,
  MAX_BUDGET_COUNTER,
} from './budgetCounterFormat'
import { assignBudgetNumber } from './budgetNumberStorage'

/*
 * Esta es la única pieza del número de presupuesto que tiene efectos
 * secundarios: lee y escribe en `localStorage`. Las tres que usa
 * —`parseBudgetCounter`, `formatBudgetNumber` y `safeLocalStorage`— son puras o
 * devuelven valores en lugar de lanzar.
 *
 * `src/test/setup.ts` vacía `localStorage` antes de cada test desde la Fase 5,
 * así que cada uno de estos arranca sin contador.
 */

/** Lee el contador crudo del navegador, para comprobar qué se ha escrito. */
function leerContadorGuardado(): unknown {
  const guardado = localStorage.getItem(BUDGET_COUNTER_STORAGE_KEY)

  return guardado === null ? null : JSON.parse(guardado)
}

const EMISION_2026 = new Date(2026, 10, 25)

describe('assignBudgetNumber', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reparte el 0001 cuando no hay ningún contador guardado', () => {
    expect(assignBudgetNumber(EMISION_2026)).toBe('PRE-2026-0001')
  })

  it('guarda el contador después de repartir un número', () => {
    assignBudgetNumber(EMISION_2026)

    expect(leerContadorGuardado()).toEqual({ year: 2026, lastNumber: 1 })
  })

  it('avanza el contador en cada llamada', () => {
    /*
     * **El test central de la función.** Cada llamada reparte un número y
     * ninguno se repite. Quién la llama y cuándo —una sola vez, al abrir el
     * documento— es decisión del componente, no de aquí: esta función reparte
     * un número cada vez que se le pide.
     */
    expect(assignBudgetNumber(EMISION_2026)).toBe('PRE-2026-0001')
    expect(assignBudgetNumber(EMISION_2026)).toBe('PRE-2026-0002')
    expect(assignBudgetNumber(EMISION_2026)).toBe('PRE-2026-0003')

    expect(leerContadorGuardado()).toEqual({ year: 2026, lastNumber: 3 })
  })

  it('continúa la serie de un contador guardado por una visita anterior', () => {
    // Es el caso real: alguien emitió 41 presupuestos la semana pasada, cerró
    // el navegador y vuelve hoy. El siguiente es el 42, no el 1.
    localStorage.setItem(
      BUDGET_COUNTER_STORAGE_KEY,
      JSON.stringify({ year: 2026, lastNumber: 41 }),
    )

    expect(assignBudgetNumber(EMISION_2026)).toBe('PRE-2026-0042')
  })

  it('empieza una serie nueva al cambiar el año', () => {
    /*
     * El año va dentro del número, así que la numeración es anual: el primer
     * presupuesto de 2027 es el `PRE-2027-0001` aunque en 2026 se hubieran
     * emitido 128. Es como funciona cualquier numeración de facturas.
     */
    localStorage.setItem(
      BUDGET_COUNTER_STORAGE_KEY,
      JSON.stringify({ year: 2026, lastNumber: 128 }),
    )

    expect(assignBudgetNumber(new Date(2027, 0, 2))).toBe('PRE-2027-0001')
    expect(leerContadorGuardado()).toEqual({ year: 2027, lastNumber: 1 })
  })

  it.each([
    ['un JSON roto', '{esto no es json'],
    ['un texto cualquiera', '"PRE-2026-0001"'],
    ['un array', '[{"year":2026,"lastNumber":4}]'],
    ['un objeto sin los campos', '{"anio":2026}'],
    ['un año imposible', '{"year":99,"lastNumber":4}'],
    ['un último número negativo', '{"year":2026,"lastNumber":-4}'],
    ['un último número decimal', '{"year":2026,"lastNumber":4.5}'],
    ['un último número descomunal', '{"year":2026,"lastNumber":1e21}'],
  ])('empieza de nuevo con %s guardado', (_descripcion, guardado) => {
    /*
     * Un contador dañado no rompe la aplicación y no deja el documento sin
     * número: empieza una serie nueva. Es la decisión del apartado 4.6 —lo que
     * no se entiende se descarta y se empieza de cero— aplicada al contador.
     *
     * El último caso es el que importa de verdad: sin el tope de
     * `parseBudgetCounter`, `1e21` pasaría la validación de enteros y el
     * documento llevaría impreso `PRE-2026-1e+21`.
     */
    localStorage.setItem(BUDGET_COUNTER_STORAGE_KEY, guardado)

    expect(assignBudgetNumber(EMISION_2026)).toBe('PRE-2026-0001')
    expect(leerContadorGuardado()).toEqual({ year: 2026, lastNumber: 1 })
  })

  it('empieza una serie nueva al desbordar el tope del contador', () => {
    // Inalcanzable en un uso real —son cien mil presupuestos desde el mismo
    // navegador—, pero el comportamiento está decidido por escrito en lugar de
    // improvisado: la serie vuelve a empezar, y no se reparte un número que la
    // validación rechazaría en la visita siguiente.
    localStorage.setItem(
      BUDGET_COUNTER_STORAGE_KEY,
      JSON.stringify({ year: 2026, lastNumber: MAX_BUDGET_COUNTER }),
    )

    expect(assignBudgetNumber(EMISION_2026)).toBe('PRE-2026-0001')
  })

  it('reparte un número aunque el navegador no permita leer', () => {
    /*
     * Navegación privada, cookies bloqueadas o cuota agotada. El documento
     * **siempre** tiene número: lo que se pierde es la memoria de cuál fue el
     * último, no el número en sí. Es la misma decisión que con los borradores en
     * la Fase 5: la aplicación funciona igual, simplemente sin recordar.
     *
     * El fallo se **provoca** en lugar de darse por supuesto: un caso que no se
     * provoca no está probado.
     */
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('El navegador no permite leer')
    })

    expect(assignBudgetNumber(EMISION_2026)).toBe('PRE-2026-0001')
  })

  it('reparte un número aunque el navegador no permita escribir', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Cuota agotada')
    })

    expect(assignBudgetNumber(EMISION_2026)).toBe('PRE-2026-0001')
    // Y sin poder guardar, la serie no avanza: las dos llamadas dan el mismo
    // número. Es la consecuencia inevitable y conviene que esté escrita.
    expect(assignBudgetNumber(EMISION_2026)).toBe('PRE-2026-0001')
  })

  it('no toca el borrador del presupuesto', () => {
    /*
     * Las dos claves son distintas a propósito, y este test lo fija: «Empezar de
     * nuevo» borra el borrador y **no** el contador, porque el presupuesto
     * siguiente tiene que recibir un número nuevo en lugar de repetir el
     * anterior. Si las dos cosas compartieran clave, una borraría la otra.
     */
    localStorage.setItem('configurador-presupuestos:budget-draft:v1', '{"x":1}')

    assignBudgetNumber(EMISION_2026)

    expect(
      localStorage.getItem('configurador-presupuestos:budget-draft:v1'),
    ).toBe('{"x":1}')
  })

  it('lanza un error con una fecha de emisión inválida', () => {
    expect(() => assignBudgetNumber(new Date('no es una fecha'))).toThrow(
      /fecha válida/i,
    )
  })
})
