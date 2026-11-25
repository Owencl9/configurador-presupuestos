import { describe, expect, it } from 'vitest'

import {
  MAX_MONTHS,
  MAX_QUANTITY,
  MIN_QUANTITY,
} from '../../shared/constants/business-rules'
import type {
  MonthlyService,
  OneTimeService,
  Service,
  YearlyService,
} from '../../shared/types/service'
import { isMonthlyLine } from '../../shared/utils/isMonthlyLine'
import { parseDraft } from './parseDraft'

/*
 * Catálogo inventado de cuatro servicios. Que no sea el real es deliberado y
 * aquí importa más que en otros tests: lo que se prueba es qué hace la función
 * con un identificador **que no está** en el catálogo, y con un catálogo de
 * mentira se puede elegir qué hay y qué no.
 *
 * Los dos mensuales tienen mínimos distintos (6 y 3) para distinguir «usa el
 * mínimo de ese servicio» de «usa un número fijo».
 */
const WEB: OneTimeService = {
  id: 'web',
  name: 'Web de ejemplo',
  description: 'Solo para los tests.',
  category: 'web-design',
  priceCents: 120_000,
  payment: 'one-time',
}

const SEO: MonthlyService = {
  id: 'seo',
  name: 'SEO de ejemplo',
  description: 'Solo para los tests.',
  category: 'marketing',
  priceCents: 25_000,
  payment: 'monthly',
  minMonths: 6,
}

const REDES: MonthlyService = {
  id: 'redes',
  name: 'Redes de ejemplo',
  description: 'Solo para los tests.',
  category: 'marketing',
  priceCents: 30_000,
  payment: 'monthly',
  minMonths: 3,
}

const HOSTING: YearlyService = {
  id: 'hosting',
  name: 'Hosting de ejemplo',
  description: 'Solo para los tests.',
  category: 'infrastructure',
  priceCents: 12_000,
  payment: 'yearly',
}

const CATALOGO: readonly Service[] = [WEB, SEO, REDES, HOSTING]

/** Atajo: `parseDraft` siempre con el mismo catálogo de mentira. */
const parse = (raw: unknown) => parseDraft(raw, CATALOGO)

describe('parseDraft', () => {
  describe('daño estructural: se descarta el borrador entero', () => {
    it('descarta lo que no es un objeto', () => {
      expect(parse(null)).toEqual([])
      expect(parse(undefined)).toEqual([])
      expect(parse(42)).toEqual([])
      expect(parse('{"lines":[]}')).toEqual([])
      expect(parse(true)).toEqual([])
    })

    it('descarta un array suelto, aunque contenga líneas con buena pinta', () => {
      // El formato es `{ lines: [...] }`. Un array suelto es otro formato, y un
      // formato desconocido no se interpreta: se descarta.
      expect(parse([{ serviceId: 'web', quantity: 1 }])).toEqual([])
    })

    it('descarta un objeto sin el campo lines', () => {
      expect(parse({})).toEqual([])
      expect(parse({ borrador: 'sí' })).toEqual([])
    })

    it('descarta un objeto cuyo campo lines no es un array', () => {
      expect(parse({ lines: 'web' })).toEqual([])
      expect(parse({ lines: 7 })).toEqual([])
      expect(parse({ lines: { serviceId: 'web' } })).toEqual([])
      expect(parse({ lines: null })).toEqual([])
    })

    it('un borrador sin líneas es válido y da un presupuesto vacío', () => {
      // No es daño: es un presupuesto que se vació. No hay nada que descartar.
      expect(parse({ lines: [] })).toEqual([])
    })
  })

  describe('líneas válidas', () => {
    it('recupera una línea de pago único con su cantidad', () => {
      const resultado = parse({
        lines: [{ serviceId: 'web', quantity: 2 }],
      })

      expect(resultado).toEqual([{ service: WEB, quantity: 2 }])
    })

    it('el servicio es el objeto del catálogo, no una copia del borrador', () => {
      /*
       * Es la comprobación que sostiene todo el criterio de seguridad de la
       * fase: `toBe` compara identidad, no contenido. Si la línea apuntara a un
       * objeto reconstruido a partir de lo guardado, este test fallaría, y con
       * él se iría la garantía de que los precios salen siempre del catálogo.
       */
      const resultado = parse({ lines: [{ serviceId: 'web', quantity: 1 }] })

      expect(resultado[0].service).toBe(WEB)
    })

    it('recupera una línea mensual con sus meses', () => {
      const resultado = parse({
        lines: [{ serviceId: 'seo', quantity: 1, months: 12 }],
      })

      expect(resultado).toEqual([{ service: SEO, quantity: 1, months: 12 }])
    })

    it('conserva el orden en que estaban guardadas', () => {
      const resultado = parse({
        lines: [
          { serviceId: 'hosting', quantity: 1 },
          { serviceId: 'web', quantity: 1 },
          { serviceId: 'seo', quantity: 1, months: 6 },
        ],
      })

      expect(resultado.map((linea) => linea.service.id)).toEqual([
        'hosting',
        'web',
        'seo',
      ])
    })
  })

  describe('líneas malas: se descarta la línea, no el borrador', () => {
    it('descarta una línea que no es un objeto y conserva las válidas', () => {
      const resultado = parse({
        lines: ['web', null, 42, ['web', 1], { serviceId: 'web', quantity: 1 }],
      })

      expect(resultado).toEqual([{ service: WEB, quantity: 1 }])
    })

    it('descarta una línea sin serviceId o con un serviceId que no es texto', () => {
      const resultado = parse({
        lines: [
          { quantity: 1 },
          { serviceId: 7, quantity: 1 },
          { serviceId: null, quantity: 1 },
          { serviceId: '', quantity: 1 },
          { serviceId: 'web', quantity: 1 },
        ],
      })

      expect(resultado).toEqual([{ service: WEB, quantity: 1 }])
    })

    it('descarta una línea cuyo servicio ya no está en el catálogo', () => {
      /*
       * El caso más probable de todos: un borrador guardado antes de que el
       * servicio se retirara del catálogo. Se descarta esa línea y se conserva
       * el resto del presupuesto, porque es trabajo legítimo del usuario y lo
       * único que ha dejado de existir es un servicio.
       */
      const resultado = parse({
        lines: [
          { serviceId: 'servicio-retirado', quantity: 1 },
          { serviceId: 'web', quantity: 1 },
        ],
      })

      expect(resultado).toEqual([{ service: WEB, quantity: 1 }])
    })

    it('con un servicio repetido se queda la primera línea', () => {
      /*
       * El presupuesto no admite dos líneas del mismo servicio: la cantidad
       * está para eso, y `toggle-service` lo garantiza. Un borrador con
       * repetidos está editado a mano, y dos líneas del mismo servicio
       * duplicarían su importe.
       */
      const resultado = parse({
        lines: [
          { serviceId: 'web', quantity: 2 },
          { serviceId: 'web', quantity: 5 },
        ],
      })

      expect(resultado).toEqual([{ service: WEB, quantity: 2 }])
    })
  })

  describe('números fuera de rango: se normalizan, no se descartan', () => {
    it('sube al mínimo una cantidad por debajo del mínimo', () => {
      expect(
        parse({ lines: [{ serviceId: 'web', quantity: 0 }] })[0].quantity,
      ).toBe(MIN_QUANTITY)
      expect(
        parse({ lines: [{ serviceId: 'web', quantity: -8 }] })[0].quantity,
      ).toBe(MIN_QUANTITY)
    })

    it('baja al máximo una cantidad por encima del máximo', () => {
      const resultado = parse({
        lines: [{ serviceId: 'web', quantity: 10_000 }],
      })

      expect(resultado[0].quantity).toBe(MAX_QUANTITY)
      // El error que esta comprobación descarta: tratar todo lo inválido igual
      // y devolver el mínimo. Es la corrección C4-7 de la Fase 4.
      expect(resultado[0].quantity).not.toBe(MIN_QUANTITY)
    })

    it('trunca una cantidad decimal', () => {
      expect(
        parse({ lines: [{ serviceId: 'web', quantity: 3.9 }] })[0].quantity,
      ).toBe(3)
    })

    it('manda al mínimo una cantidad que no es un número', () => {
      expect(parse({ lines: [{ serviceId: 'web' }] })[0].quantity).toBe(
        MIN_QUANTITY,
      )
      expect(
        parse({ lines: [{ serviceId: 'web', quantity: 'tres' }] })[0].quantity,
      ).toBe(MIN_QUANTITY)
      expect(
        parse({ lines: [{ serviceId: 'web', quantity: null }] })[0].quantity,
      ).toBe(MIN_QUANTITY)
      expect(
        parse({ lines: [{ serviceId: 'web', quantity: {} }] })[0].quantity,
      ).toBe(MIN_QUANTITY)
    })

    it('sube los meses al mínimo del servicio, que no es el mismo en todos', () => {
      const conSeo = parse({
        lines: [{ serviceId: 'seo', quantity: 1, months: 2 }],
      })
      const conRedes = parse({
        lines: [{ serviceId: 'redes', quantity: 1, months: 1 }],
      })

      expect(conSeo).toEqual([{ service: SEO, quantity: 1, months: 6 }])
      expect(conRedes).toEqual([{ service: REDES, quantity: 1, months: 3 }])
    })

    it('baja los meses al máximo', () => {
      const resultado = parse({
        lines: [{ serviceId: 'seo', quantity: 1, months: 500 }],
      })

      expect(resultado).toEqual([
        { service: SEO, quantity: 1, months: MAX_MONTHS },
      ])
    })

    it('pone el mínimo del servicio si faltan los meses de una línea mensual', () => {
      const resultado = parse({ lines: [{ serviceId: 'seo', quantity: 1 }] })

      expect(resultado).toEqual([{ service: SEO, quantity: 1, months: 6 }])
    })

    it('pone el mínimo del servicio si los meses no son un número', () => {
      const resultado = parse({
        lines: [{ serviceId: 'redes', quantity: 1, months: 'muchos' }],
      })

      expect(resultado).toEqual([{ service: REDES, quantity: 1, months: 3 }])
    })
  })

  describe('lo que se ignora', () => {
    it('ignora los meses de un servicio que no es mensual', () => {
      const resultado = parse({
        lines: [
          { serviceId: 'web', quantity: 1, months: 24 },
          { serviceId: 'hosting', quantity: 1, months: 24 },
        ],
      })

      expect(resultado[0]).not.toHaveProperty('months')
      expect(resultado[1]).not.toHaveProperty('months')
      expect(resultado.some(isMonthlyLine)).toBe(false)
    })

    it('ignora cualquier campo de más, y el precio sigue saliendo del catálogo', () => {
      /*
       * Este es el ataque que el formato del borrador existe para impedir:
       * editar `localStorage` para rebajarse el precio. El borrador afirma que
       * la web cuesta un céntimo y que la línea vale 0; la línea recuperada
       * cuesta lo que dice el catálogo.
       */
      const resultado = parse({
        lines: [
          {
            serviceId: 'web',
            quantity: 1,
            priceCents: 1,
            name: 'Web gratis',
            amountCents: 0,
            discountCents: 999_999,
          },
        ],
      })

      expect(resultado).toEqual([{ service: WEB, quantity: 1 }])
      expect(resultado[0].service.priceCents).toBe(120_000)
      expect(resultado[0].service.name).toBe('Web de ejemplo')
    })
  })
})
