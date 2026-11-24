import { describe, expect, it } from 'vitest'

import {
  AMOUNT_DISCOUNT_PERCENT,
  AMOUNT_DISCOUNT_THRESHOLD_CENTS,
  COMMITMENT_DISCOUNT_MIN_MONTHS,
  COMMITMENT_DISCOUNT_PERCENT,
  IGIC_RATE_PERCENT,
  MAX_TOTAL_DISCOUNT_PERCENT,
  PACK_DISCOUNT_MIN_SERVICES,
  PACK_DISCOUNT_PERCENT,
} from './business-rules'

/*
 * Tests de coherencia de las reglas de negocio.
 *
 * Este archivo no prueba ninguna lógica: prueba los *valores*, igual que
 * `services.test.ts` prueba el catálogo. El motivo es el mismo. El archivo de
 * constantes está hecho para editarse a mano —cambiar el IGIC es su razón de
 * existir— y una edición incoherente no da ningún error visible: da un
 * presupuesto mal calculado, o un descuento que nunca se aplica.
 */
describe('reglas de negocio', () => {
  describe('IGIC', () => {
    it('es un porcentaje entre 0 y 100', () => {
      expect(IGIC_RATE_PERCENT).toBeGreaterThanOrEqual(0)
      expect(IGIC_RATE_PERCENT).toBeLessThanOrEqual(100)
    })

    it('es un múltiplo de medio punto, para que el redondeo sea exacto', () => {
      /*
       * No exige un entero, porque los tipos reducidos del IGIC incluyen el
       * 9,5 %. Exige que el tipo sea múltiplo de 0,5, que es justo la condición
       * que garantiza que `base * tipo` no tenga error de coma flotante: los
       * medios tienen representación binaria exacta y las décimas no. Un tipo
       * del 7,1 % obligaría a pasar el archivo a milésimas. Ver ADR 0007.
       */
      expect(Number.isInteger(IGIC_RATE_PERCENT * 2)).toBe(true)
    })
  })

  describe('descuentos', () => {
    const PORCENTAJES = {
      pack: PACK_DISCOUNT_PERCENT,
      permanencia: COMMITMENT_DISCOUNT_PERCENT,
      importe: AMOUNT_DISCOUNT_PERCENT,
      tope: MAX_TOTAL_DISCOUNT_PERCENT,
    }

    it.each(Object.entries(PORCENTAJES))(
      'expresa el porcentaje de «%s» como un entero entre 0 y 100',
      (_nombre, porcentaje) => {
        expect(Number.isInteger(porcentaje)).toBe(true)
        expect(porcentaje).toBeGreaterThanOrEqual(0)
        expect(porcentaje).toBeLessThanOrEqual(100)
      },
    )

    it('no deja ningún descuento individual por encima del tope total', () => {
      /*
       * Si el descuento por permanencia subiera al 25 % con el tope en el 20 %,
       * el 10 % y el 25 % darían exactamente el mismo resultado siempre: el
       * valor dejaría de significar nada y nadie lo notaría.
       */
      for (const [nombre, porcentaje] of Object.entries(PORCENTAJES)) {
        expect(
          porcentaje,
          `el descuento «${nombre}» supera el tope`,
        ).toBeLessThanOrEqual(MAX_TOTAL_DISCOUNT_PERCENT)
      }
    })

    it('exige al menos dos servicios para que un pack sea un pack', () => {
      expect(Number.isInteger(PACK_DISCOUNT_MIN_SERVICES)).toBe(true)
      expect(PACK_DISCOUNT_MIN_SERVICES).toBeGreaterThanOrEqual(2)
    })

    it('exige un número entero y positivo de meses para la permanencia', () => {
      expect(Number.isInteger(COMMITMENT_DISCOUNT_MIN_MONTHS)).toBe(true)
      expect(COMMITMENT_DISCOUNT_MIN_MONTHS).toBeGreaterThanOrEqual(1)
    })

    it('expresa el umbral de importe como un entero positivo de céntimos', () => {
      // En céntimos, como todo el dinero del proyecto (ADR 0003). Si alguien
      // escribiera aquí 3000 pensando en euros, el descuento se aplicaría a
      // partir de 30 € y el error pasaría desapercibido.
      expect(Number.isInteger(AMOUNT_DISCOUNT_THRESHOLD_CENTS)).toBe(true)
      expect(AMOUNT_DISCOUNT_THRESHOLD_CENTS).toBeGreaterThan(0)
    })
  })
})
