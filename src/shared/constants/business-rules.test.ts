import { describe, expect, it } from 'vitest'

import {
  AMOUNT_DISCOUNT_PERCENT,
  AMOUNT_DISCOUNT_THRESHOLD_CENTS,
  COMMITMENT_DISCOUNT_MIN_MONTHS,
  COMMITMENT_DISCOUNT_PERCENT,
  IGIC_RATE_PERCENT,
  MAX_MONTHS,
  MAX_QUANTITY,
  MAX_TOTAL_DISCOUNT_PERCENT,
  MIN_QUANTITY,
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

  /*
   * Límites de los selectores (Fase 4).
   *
   * No son reglas de precio, pero son reglas: deciden qué puede escribir una
   * persona en el presupuesto y, desde la Fase 5, qué se acepta de un borrador
   * guardado. Viven aquí porque el apartado 4.3 pide un único archivo de
   * constantes, y porque el tope de meses tiene que convivir con el mínimo del
   * descuento por permanencia, que está dos bloques más arriba.
   */
  describe('límites de cantidad y meses', () => {
    it('exige una unidad como mínimo de cantidad', () => {
      // Una línea con cero unidades no es una línea con cero: es una línea que
      // habría que haber borrado.
      expect(Number.isInteger(MIN_QUANTITY)).toBe(true)
      expect(MIN_QUANTITY).toBeGreaterThanOrEqual(1)
    })

    it('pone el tope de cantidad por encima del mínimo', () => {
      expect(Number.isInteger(MAX_QUANTITY)).toBe(true)
      expect(MAX_QUANTITY).toBeGreaterThan(MIN_QUANTITY)
    })

    it('pone el tope de meses por encima del mínimo del descuento por permanencia', () => {
      /*
       * **El test importante de este bloque.** Si el tope de meses bajara por
       * debajo de los 12 del descuento por permanencia, ese descuento quedaría
       * inalcanzable: nadie podría contratar los meses que hacen falta para
       * activarlo. No daría ningún error —ni de compilación, ni en pantalla—,
       * solo una regla de negocio que no se cumple nunca y un presupuesto más
       * caro de lo que dice la especificación.
       *
       * Es el mismo criterio que el test de «ningún descuento supera el tope»
       * de más arriba: lo que se vigila no es un valor, es que dos valores
       * sigan teniendo sentido juntos.
       */
      expect(Number.isInteger(MAX_MONTHS)).toBe(true)
      expect(MAX_MONTHS).toBeGreaterThan(COMMITMENT_DISCOUNT_MIN_MONTHS)
    })
  })
})
