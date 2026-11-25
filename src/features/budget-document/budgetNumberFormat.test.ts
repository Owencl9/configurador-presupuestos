import { describe, expect, it } from 'vitest'

import { formatBudgetNumber } from './budgetNumberFormat'

describe('formatBudgetNumber', () => {
  it('escribe el número en el formato PRE-AAAA-NNNN', () => {
    expect(formatBudgetNumber(2026, 1)).toBe('PRE-2026-0001')
  })

  it('rellena el contador con ceros hasta cuatro cifras', () => {
    expect(formatBudgetNumber(2026, 7)).toBe('PRE-2026-0007')
    expect(formatBudgetNumber(2026, 42)).toBe('PRE-2026-0042')
    expect(formatBudgetNumber(2026, 530)).toBe('PRE-2026-0530')
    expect(formatBudgetNumber(2026, 9999)).toBe('PRE-2026-9999')
  })

  it('usa el año que recibe y no el del sistema', () => {
    /*
     * El año no se lee aquí dentro con `new Date().getFullYear()` a propósito:
     * el año que lleva el número es el de la **fecha de emisión** del
     * presupuesto, que es un dato que llega de fuera. Si esta función
     * consultara el reloj, no se podría probar con un año fijo y, peor, un
     * presupuesto emitido el 31 de diciembre a las 23:59 podría llevar un año
     * distinto en el número y en la fecha.
     */
    expect(formatBudgetNumber(2027, 1)).toBe('PRE-2027-0001')
    expect(formatBudgetNumber(2030, 123)).toBe('PRE-2030-0123')
  })

  it('crece a cinco cifras por encima de 9999 en lugar de volver a empezar', () => {
    /*
     * Decisión tomada al planificar la fase: el relleno es un **mínimo** de
     * cuatro cifras, no un máximo. Las alternativas eran peores: volver a 1
     * daría dos presupuestos con el mismo número, y cortar a cuatro cifras
     * daría `PRE-2026-0000` para el 10.000. Un número de presupuesto repetido
     * es exactamente lo que un número de presupuesto existe para evitar.
     *
     * Es un caso que no va a ocurrir —son diez mil presupuestos en un año desde
     * un solo navegador—, y precisamente por eso conviene que esté decidido por
     * escrito y no improvisado el día que ocurra.
     */
    expect(formatBudgetNumber(2026, 10_000)).toBe('PRE-2026-10000')
    expect(formatBudgetNumber(2026, 123_456)).toBe('PRE-2026-123456')
  })

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'lanza un error con el contador %p',
    (contador) => {
      // El contador se lee de `localStorage`, donde puede haber cualquier cosa.
      // Quien lo valida es `parseBudgetCounter` (ciclo 3); esta función lanza
      // porque un número de presupuesto con un `NaN` dentro acabaría impreso.
      expect(() => formatBudgetNumber(2026, contador)).toThrow(/contador/i)
    },
  )

  it.each([999, 10_000, 2026.5, Number.NaN])(
    'lanza un error con el año %p',
    (anio) => {
      // Cuatro cifras exactas: el formato las reserva. Un año de tres o de
      // cinco rompería la forma `PRE-AAAA-NNNN` sin que nada lo avisara.
      expect(() => formatBudgetNumber(anio, 1)).toThrow(/año/i)
    },
  )
})
