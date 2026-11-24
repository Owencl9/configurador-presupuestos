import { describe, expect, it } from 'vitest'

import type { BudgetLine } from '../shared/types/budget'
import type {
  MonthlyService,
  OneTimeService,
  YearlyService,
} from '../shared/types/service'
import type { BudgetAction, BudgetState } from './budgetReducer'
import { budgetReducer } from './budgetReducer'

/*
 * Servicios inventados, no el catálogo real, con el mismo criterio que el resto
 * de los tests de lógica: lo que se prueba es cómo cambia el estado, así que
 * cambiar una tarifa del catálogo no debe romper nada de aquí.
 *
 * Los dos servicios mensuales tienen mínimos **distintos** (6 y 3) a propósito:
 * es la única forma de distinguir «pone los meses mínimos del servicio» de
 * «pone un 6 escrito a mano».
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

/** Presupuesto vacío, que es el estado con el que arranca la aplicación. */
const VACIO: BudgetState = []

describe('budgetReducer', () => {
  describe('toggle-service', () => {
    it('añade la línea de un servicio que no estaba, con una unidad', () => {
      const resultado = budgetReducer(VACIO, {
        type: 'toggle-service',
        service: WEB,
      })

      expect(resultado).toEqual([{ service: WEB, quantity: 1 }])
    })

    it('añade un servicio mensual con los meses mínimos de ese servicio', () => {
      // REDES tiene 3 meses mínimos, no 6: si el reducer escribiera un número
      // fijo, este test lo delataría y el de SEO no.
      const resultado = budgetReducer(VACIO, {
        type: 'toggle-service',
        service: REDES,
      })

      expect(resultado).toEqual([{ service: REDES, quantity: 1, months: 3 }])
    })

    it('añade al final y conserva el orden en que se añadieron', () => {
      const unaLinea = budgetReducer(VACIO, {
        type: 'toggle-service',
        service: WEB,
      })

      const dosLineas = budgetReducer(unaLinea, {
        type: 'toggle-service',
        service: SEO,
      })

      expect(dosLineas.map((linea) => linea.service.id)).toEqual(['web', 'seo'])
    })

    it('quita el servicio si ya estaba en el presupuesto', () => {
      const conWeb: BudgetState = [{ service: WEB, quantity: 1 }]

      const resultado = budgetReducer(conWeb, {
        type: 'toggle-service',
        service: WEB,
      })

      expect(resultado).toEqual([])
    })

    it('al quitar, conserva las demás líneas y su orden', () => {
      const tresLineas: BudgetState = [
        { service: WEB, quantity: 1 },
        { service: SEO, quantity: 1, months: 6 },
        { service: HOSTING, quantity: 1 },
      ]

      const resultado = budgetReducer(tresLineas, {
        type: 'toggle-service',
        service: SEO,
      })

      expect(resultado.map((linea) => linea.service.id)).toEqual([
        'web',
        'hosting',
      ])
    })

    it('un servicio que se quita y se vuelve a añadir nace con los valores iniciales', () => {
      /*
       * Es el comportamiento que ya tenía la Fase 4 y conviene fijarlo: quitar
       * una línea olvida su cantidad y sus meses. La alternativa —recordarlos
       * para devolverlos si se vuelve a añadir— significaría guardar el estado
       * de servicios que no están en el presupuesto, y no está pedida.
       */
      const modificado: BudgetState = [
        { service: SEO, quantity: 4, months: 24 },
      ]

      const sinSeo = budgetReducer(modificado, {
        type: 'toggle-service',
        service: SEO,
      })
      const otraVez = budgetReducer(sinSeo, {
        type: 'toggle-service',
        service: SEO,
      })

      expect(otraVez).toEqual([{ service: SEO, quantity: 1, months: 6 }])
    })
  })

  describe('change-quantity', () => {
    it('cambia la cantidad de la línea indicada', () => {
      const conWeb: BudgetState = [{ service: WEB, quantity: 1 }]

      const resultado = budgetReducer(conWeb, {
        type: 'change-quantity',
        serviceId: 'web',
        quantity: 3,
      })

      expect(resultado).toEqual([{ service: WEB, quantity: 3 }])
    })

    it('no toca las demás líneas', () => {
      const dosLineas: BudgetState = [
        { service: WEB, quantity: 1 },
        { service: SEO, quantity: 2, months: 6 },
      ]

      const resultado = budgetReducer(dosLineas, {
        type: 'change-quantity',
        serviceId: 'web',
        quantity: 5,
      })

      expect(resultado).toEqual([
        { service: WEB, quantity: 5 },
        { service: SEO, quantity: 2, months: 6 },
      ])
    })

    it('no cambia nada si el identificador no está en el presupuesto', () => {
      const conWeb: BudgetState = [{ service: WEB, quantity: 1 }]

      const resultado = budgetReducer(conWeb, {
        type: 'change-quantity',
        serviceId: 'no-existe',
        quantity: 9,
      })

      expect(resultado).toEqual(conWeb)
    })
  })

  describe('change-months', () => {
    it('cambia los meses de una línea mensual', () => {
      const conSeo: BudgetState = [{ service: SEO, quantity: 1, months: 6 }]

      const resultado = budgetReducer(conSeo, {
        type: 'change-months',
        serviceId: 'seo',
        months: 12,
      })

      expect(resultado).toEqual([{ service: SEO, quantity: 1, months: 12 }])
    })

    it('no cambia nada en una línea que no es mensual', () => {
      /*
       * No debería llegar nunca: los meses solo tienen selector en las líneas
       * mensuales. Se comprueba porque la alternativa sería escribir `months`
       * en una línea anual, que es un dato imposible, y porque el precio de
       * comprobarlo es una llamada a `isMonthlyLine`, que ya existe.
       */
      const conHosting: BudgetState = [{ service: HOSTING, quantity: 1 }]

      const resultado = budgetReducer(conHosting, {
        type: 'change-months',
        serviceId: 'hosting',
        months: 12,
      })

      expect(resultado).toEqual([{ service: HOSTING, quantity: 1 }])
    })
  })

  describe('remove-service', () => {
    it('quita la línea del servicio indicado', () => {
      const dosLineas: BudgetState = [
        { service: WEB, quantity: 1 },
        { service: SEO, quantity: 1, months: 6 },
      ]

      const resultado = budgetReducer(dosLineas, {
        type: 'remove-service',
        serviceId: 'web',
      })

      expect(resultado).toEqual([{ service: SEO, quantity: 1, months: 6 }])
    })

    it('no cambia nada si el identificador no está en el presupuesto', () => {
      const conWeb: BudgetState = [{ service: WEB, quantity: 1 }]

      const resultado = budgetReducer(conWeb, {
        type: 'remove-service',
        serviceId: 'no-existe',
      })

      expect(resultado).toEqual(conWeb)
    })
  })

  describe('reset', () => {
    it('vacía el presupuesto', () => {
      const dosLineas: BudgetState = [
        { service: WEB, quantity: 1 },
        { service: SEO, quantity: 1, months: 6 },
      ]

      expect(budgetReducer(dosLineas, { type: 'reset' })).toEqual([])
    })
  })

  describe('pureza', () => {
    /*
     * Un reducer **no puede** modificar el estado que recibe: React compara la
     * referencia del estado nuevo con la del anterior para decidir si hay que
     * volver a dibujar. Si se modifica el array en su sitio, la referencia no
     * cambia y la pantalla se queda como estaba.
     *
     * `Object.freeze` lo convierte en un error visible: los módulos de
     * JavaScript se ejecutan en modo estricto, así que escribir en un objeto
     * congelado lanza un `TypeError` en lugar de no hacer nada.
     */
    it('no modifica el array de líneas que recibe', () => {
      const original: readonly BudgetLine[] = Object.freeze([
        { service: WEB, quantity: 1 },
      ])

      budgetReducer(original, {
        type: 'toggle-service',
        service: SEO,
      })
      budgetReducer(original, {
        type: 'remove-service',
        serviceId: 'web',
      })

      expect(original).toEqual([{ service: WEB, quantity: 1 }])
    })

    it('no modifica la línea que cambia, crea una nueva', () => {
      const linea = Object.freeze({ service: SEO, quantity: 1, months: 6 })
      const original: readonly BudgetLine[] = Object.freeze([linea])

      const resultado = budgetReducer(original, {
        type: 'change-months',
        serviceId: 'seo',
        months: 24,
      })

      expect(linea.months).toBe(6)
      expect(resultado[0]).not.toBe(linea)
      expect(resultado[0]).toEqual({ service: SEO, quantity: 1, months: 24 })
    })
  })

  describe('garantías de tipos y acciones imposibles', () => {
    it('lanza un error con nombre si llega una acción no contemplada', () => {
      /*
       * Por el tipo `BudgetAction` esto no puede ocurrir, y la conversión de
       * abajo es lo que hace falta para escribir el test. Se comprueba de
       * todas formas, con el mismo criterio que `createBudgetLine` y
       * `calculateSubtotals`: si algún día se añade una acción a la unión y se
       * olvida su `case`, el error aparece nombrando la acción en lugar de
       * devolver el estado como si nada hubiera pasado.
       */
      const accionInventada = {
        type: 'descontar-el-iva',
      } as unknown as BudgetAction

      expect(() => budgetReducer(VACIO, accionInventada)).toThrow(
        /descontar-el-iva/,
      )
    })

    it('no deja despachar una acción con un tipo desconocido', () => {
      // @ts-expect-error — 'vaciar' no es una de las acciones de BudgetAction.
      expect(() => budgetReducer(VACIO, { type: 'vaciar' })).toThrow()
    })

    it('no deja despachar change-quantity sin la cantidad', () => {
      expect(() =>
        // @ts-expect-error — falta `quantity`, que es obligatoria.
        budgetReducer(VACIO, { type: 'change-quantity', serviceId: 'web' }),
      ).not.toThrow()
    })
  })
})
