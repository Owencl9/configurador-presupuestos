import { afterEach, describe, expect, it, vi } from 'vitest'

import { SERVICES } from '../../shared/data/services'
import type { BudgetLine } from '../../shared/types/budget'
import type { MonthlyService, OneTimeService } from '../../shared/types/service'
import { clearDraft, loadDraftLines, saveDraftLines } from './draftStorage'
import { DRAFT_STORAGE_KEY } from './draftFormat'

afterEach(() => {
  vi.restoreAllMocks()
})

/*
 * Este archivo usa el catálogo **real**, al contrario que los tests de
 * `parseDraft` y `serializeDraft`. Es deliberado: lo que se prueba aquí es el
 * viaje completo de ida y vuelta por `localStorage`, y el único catálogo que
 * recorre de verdad ese camino es el de la aplicación.
 */
const WEB = SERVICES.find(
  (servicio) => servicio.id === 'corporate-website',
) as OneTimeService

const SEO = SERVICES.find(
  (servicio) => servicio.id === 'seo-basic',
) as MonthlyService

const LINEAS: readonly BudgetLine[] = [
  { service: WEB, quantity: 2 },
  { service: SEO, quantity: 1, months: 12 },
]

function hacerFallar(metodo: 'getItem' | 'setItem' | 'removeItem') {
  vi.spyOn(Storage.prototype, metodo).mockImplementation(() => {
    throw new DOMException('Acceso denegado al almacenamiento', 'SecurityError')
  })
}

describe('draftStorage', () => {
  describe('la clave', () => {
    it('lleva la versión del formato y el nombre de la aplicación', () => {
      expect(DRAFT_STORAGE_KEY).toBe(
        'configurador-presupuestos:budget-draft:v1',
      )
    })

    it('es la clave bajo la que se guarda de verdad', () => {
      saveDraftLines(LINEAS)

      expect(localStorage.getItem(DRAFT_STORAGE_KEY)).not.toBeNull()
    })
  })

  describe('ida y vuelta', () => {
    it('recupera las mismas líneas que se guardaron', () => {
      saveDraftLines(LINEAS)

      expect(loadDraftLines(SERVICES)).toEqual(LINEAS)
    })

    it('los servicios recuperados son los objetos del catálogo', () => {
      saveDraftLines(LINEAS)

      const recuperadas = loadDraftLines(SERVICES)

      expect(recuperadas[0].service).toBe(WEB)
      expect(recuperadas[1].service).toBe(SEO)
    })

    it('devuelve un presupuesto vacío si no hay nada guardado', () => {
      expect(loadDraftLines(SERVICES)).toEqual([])
    })
  })

  describe('lo guardado no incluye precios ni nombres', () => {
    it('solo escribe identificadores, cantidades y meses', () => {
      saveDraftLines(LINEAS)

      const guardado = localStorage.getItem(DRAFT_STORAGE_KEY) ?? ''

      expect(guardado).not.toContain('Web corporativa')
      expect(guardado).not.toContain('SEO Básico')
      expect(guardado).not.toContain('120000')
      expect(guardado).not.toContain('25000')

      // Control positivo de las cuatro comprobaciones de arriba: la misma
      // búsqueda, sobre el mismo texto, encuentra lo que sí tiene que estar.
      expect(guardado).toContain('corporate-website')
      expect(guardado).toContain('seo-basic')
      expect(guardado).toContain('12')
    })
  })

  describe('un presupuesto vacío no deja borrador', () => {
    it('borra la clave en lugar de guardar una lista vacía', () => {
      saveDraftLines(LINEAS)
      saveDraftLines([])

      expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull()
    })

    it('clearDraft borra el borrador guardado', () => {
      saveDraftLines(LINEAS)

      expect(clearDraft()).toBe(true)
      expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull()
      expect(loadDraftLines(SERVICES)).toEqual([])
    })
  })

  describe('datos que no son de fiar', () => {
    it('descarta un JSON roto', () => {
      localStorage.setItem(DRAFT_STORAGE_KEY, '{"lines":[{"serviceId":')

      expect(loadDraftLines(SERVICES)).toEqual([])
    })

    it('descarta un formato desconocido', () => {
      localStorage.setItem(DRAFT_STORAGE_KEY, '{"servicios":["web"]}')

      expect(loadDraftLines(SERVICES)).toEqual([])
    })

    it('descarta las líneas de servicios que no están en el catálogo recibido', () => {
      saveDraftLines(LINEAS)

      // El mismo borrador, leído con un catálogo que solo tiene la web: la
      // línea de SEO desaparece y la válida se conserva.
      expect(loadDraftLines([WEB])).toEqual([{ service: WEB, quantity: 2 }])
    })

    it('un precio escrito a mano en el borrador no llega a la línea', () => {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          lines: [
            { serviceId: 'corporate-website', quantity: 1, priceCents: 1 },
          ],
        }),
      )

      const recuperadas = loadDraftLines(SERVICES)

      expect(recuperadas[0].service.priceCents).toBe(WEB.priceCents)
      expect(recuperadas[0].service.priceCents).not.toBe(1)
    })
  })

  describe('sin almacenamiento disponible', () => {
    it('guardar devuelve false y no lanza', () => {
      hacerFallar('setItem')

      expect(() => saveDraftLines(LINEAS)).not.toThrow()
      expect(saveDraftLines(LINEAS)).toBe(false)
    })

    it('recuperar devuelve un presupuesto vacío y no lanza', () => {
      hacerFallar('getItem')

      expect(() => loadDraftLines(SERVICES)).not.toThrow()
      expect(loadDraftLines(SERVICES)).toEqual([])
    })
  })
})
