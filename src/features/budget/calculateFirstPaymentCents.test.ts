import { describe, expect, it } from 'vitest'

import type { Budget, PaymentBlock } from '../../shared/types/budget'
import { calculateFirstPaymentCents } from './calculateFirstPaymentCents'

/**
 * Atajo para escribir un bloque de pago en los tests.
 *
 * Los bloques se construyen a mano en lugar de pedírselos a `calculateBudget`,
 * para que estos tests prueben una sola cosa. Así además se pueden usar bases e
 * IGIC bien distintos, que es lo que permite saber **qué campo** se ha sumado:
 * si la función sumara las bases en lugar de los totales, el resultado no
 * cuadraría.
 */
const bloque = (taxableBaseCents: number, igicCents: number): PaymentBlock => ({
  subtotalCents: taxableBaseCents,
  discountCents: 0,
  // El campo de los motivos llega en la Fase 6. Esta función no lo mira: suma
  // los totales de los tres bloques, y un total ya lleva su descuento dentro.
  discounts: [],
  taxableBaseCents,
  igicCents,
  totalCents: taxableBaseCents + igicCents,
})

const VACIO: PaymentBlock = bloque(0, 0)

describe('calculateFirstPaymentCents', () => {
  it('devuelve cero con un presupuesto vacío', () => {
    const presupuesto: Budget = {
      oneTime: VACIO,
      monthly: VACIO,
      yearly: VACIO,
    }

    expect(calculateFirstPaymentCents(presupuesto)).toBe(0)
  })

  it('suma los totales de los tres bloques', () => {
    /*
     * El ejemplo del ADR 0007, que es el que se enseña en el README y en las
     * slides:
     *
     *   Pago inicial   2.500,00 € + IGIC 175,00 € = 2.675,00 €
     *   Cuota mensual    250,00 € + IGIC  17,50 € =   267,50 € /mes
     *   Pago anual       120,00 € + IGIC   8,40 € =   128,40 € /año
     *
     * El primer día se paga una vez cada cosa: 3.070,90 €.
     */
    const presupuesto: Budget = {
      oneTime: bloque(250_000, 17_500),
      monthly: bloque(25_000, 1_750),
      yearly: bloque(12_000, 840),
    }

    expect(calculateFirstPaymentCents(presupuesto)).toBe(307_090)
  })

  it('suma los totales con IGIC incluido, no las bases imponibles', () => {
    /*
     * El test que distingue la implementación correcta de la plausible. Las
     * bases suman 287.000 y los totales 307.090: lo que se paga es con
     * impuesto, porque es lo que el cliente saca del banco.
     */
    const presupuesto: Budget = {
      oneTime: bloque(250_000, 17_500),
      monthly: bloque(25_000, 1_750),
      yearly: bloque(12_000, 840),
    }

    expect(calculateFirstPaymentCents(presupuesto)).not.toBe(287_000)
    expect(calculateFirstPaymentCents(presupuesto)).toBe(307_090)
  })

  it('devuelve el total del pago inicial cuando no hay cuotas', () => {
    // Un presupuesto de solo diseño web: lo que se paga el primer día es todo
    // el presupuesto, y la línea informativa no añade nada nuevo. Es correcto
    // que coincidan.
    const presupuesto: Budget = {
      oneTime: bloque(120_000, 8_400),
      monthly: VACIO,
      yearly: VACIO,
    }

    expect(calculateFirstPaymentCents(presupuesto)).toBe(128_400)
  })

  it('cuenta una sola cuota mensual, no la permanencia completa', () => {
    // El primer día se paga la **primera** cuota. Multiplicar por los meses
    // contratados daría el compromiso total, que es otra cifra y no es esta.
    const presupuesto: Budget = {
      oneTime: VACIO,
      monthly: bloque(25_000, 1_750),
      yearly: VACIO,
    }

    expect(calculateFirstPaymentCents(presupuesto)).toBe(26_750)
  })

  it('devuelve un número entero de céntimos', () => {
    const presupuesto: Budget = {
      oneTime: bloque(250_000, 17_500),
      monthly: bloque(25_000, 1_750),
      yearly: bloque(12_000, 840),
    }

    expect(Number.isInteger(calculateFirstPaymentCents(presupuesto))).toBe(true)
  })

  it('no modifica el presupuesto que recibe', () => {
    const presupuesto: Budget = {
      oneTime: bloque(250_000, 17_500),
      monthly: bloque(25_000, 1_750),
      yearly: bloque(12_000, 840),
    }
    const copia = structuredClone(presupuesto)

    calculateFirstPaymentCents(presupuesto)

    expect(presupuesto).toEqual(copia)
  })
})
