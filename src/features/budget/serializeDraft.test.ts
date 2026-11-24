import { describe, expect, it } from 'vitest'

import type { BudgetLine } from '../../shared/types/budget'
import type {
  MonthlyService,
  OneTimeService,
  YearlyService,
} from '../../shared/types/service'
import { serializeDraft } from './serializeDraft'

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

const HOSTING: YearlyService = {
  id: 'hosting',
  name: 'Hosting de ejemplo',
  description: 'Solo para los tests.',
  category: 'infrastructure',
  priceCents: 12_000,
  payment: 'yearly',
}

describe('serializeDraft', () => {
  it('convierte un presupuesto vacío en un borrador sin líneas', () => {
    expect(serializeDraft([])).toEqual({ lines: [] })
  })

  it('guarda el identificador y la cantidad de una línea de pago único', () => {
    const lineas: readonly BudgetLine[] = [{ service: WEB, quantity: 2 }]

    expect(serializeDraft(lineas)).toEqual({
      lines: [{ serviceId: 'web', quantity: 2 }],
    })
  })

  it('guarda los meses de una línea mensual', () => {
    const lineas: readonly BudgetLine[] = [
      { service: SEO, quantity: 1, months: 12 },
    ]

    expect(serializeDraft(lineas)).toEqual({
      lines: [{ serviceId: 'seo', quantity: 1, months: 12 }],
    })
  })

  it('no escribe meses en una línea que no es mensual', () => {
    const lineas: readonly BudgetLine[] = [
      { service: WEB, quantity: 1 },
      { service: HOSTING, quantity: 1 },
    ]

    const borrador = serializeDraft(lineas)

    // `toEqual` ignora las claves con valor `undefined`, así que no distingue
    // «no hay meses» de «hay meses y valen undefined». Esto sí.
    expect(borrador.lines[0]).not.toHaveProperty('months')
    expect(borrador.lines[1]).not.toHaveProperty('months')
  })

  it('conserva el orden de las líneas', () => {
    const lineas: readonly BudgetLine[] = [
      { service: HOSTING, quantity: 1 },
      { service: WEB, quantity: 1 },
      { service: SEO, quantity: 1, months: 6 },
    ]

    expect(
      serializeDraft(lineas).lines.map((linea) => linea.serviceId),
    ).toEqual(['hosting', 'web', 'seo'])
  })

  describe('lo que no se guarda', () => {
    /*
     * El criterio de la fase: en `localStorage` solo entran el identificador
     * del servicio, la cantidad y los meses. Ni precios, ni nombres, ni
     * importes, ni IGIC, ni totales. Al recuperar el borrador, todo eso sale
     * del catálogo, así que editar el almacenamiento del navegador no puede
     * cambiar un precio.
     */
    const lineas: readonly BudgetLine[] = [
      { service: WEB, quantity: 2 },
      { service: SEO, quantity: 1, months: 12 },
    ]

    it('no escribe nombres ni precios en el JSON guardado', () => {
      const json = JSON.stringify(serializeDraft(lineas))

      expect(json).not.toContain('Web de ejemplo')
      expect(json).not.toContain('SEO de ejemplo')
      expect(json).not.toContain('120000')
      expect(json).not.toContain('25000')
      expect(json).not.toContain('one-time')
      expect(json).not.toContain('monthly')

      /*
       * Control positivo de las seis comprobaciones de arriba (apartado 5 de
       * CLAUDE.md). Sin esta línea, un «no contiene» no distingue entre «no se
       * guarda» y «esta búsqueda no está mirando donde cree»: si `serializeDraft`
       * devolviera un objeto vacío, los seis `not.toContain` pasarían igual.
       */
      expect(json).toContain('web')
      expect(json).toContain('seo')
    })

    it('no escribe ninguna clave que no sea una de las tres previstas', () => {
      const borrador = serializeDraft(lineas)

      expect(Object.keys(borrador)).toEqual(['lines'])
      expect(Object.keys(borrador.lines[0])).toEqual(['serviceId', 'quantity'])
      expect(Object.keys(borrador.lines[1])).toEqual([
        'serviceId',
        'quantity',
        'months',
      ])
    })
  })
})
