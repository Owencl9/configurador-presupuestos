import { describe, expect, it } from 'vitest'

import type { BudgetLine } from '../../shared/types/budget'
import type {
  MonthlyService,
  OneTimeService,
  YearlyService,
} from '../../shared/types/service'
import { isMonthlyLine } from './isMonthlyLine'

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

const LINEA_MENSUAL: BudgetLine = { service: SEO, quantity: 1, months: 6 }
const LINEA_UNICA: BudgetLine = { service: WEB, quantity: 1 }
const LINEA_ANUAL: BudgetLine = { service: HOSTING, quantity: 1 }

describe('isMonthlyLine', () => {
  it('reconoce una línea mensual', () => {
    expect(isMonthlyLine(LINEA_MENSUAL)).toBe(true)
  })

  it('rechaza una línea de pago único', () => {
    expect(isMonthlyLine(LINEA_UNICA)).toBe(false)
  })

  it('rechaza una línea de pago anual', () => {
    expect(isMonthlyLine(LINEA_ANUAL)).toBe(false)
  })

  it('da acceso a los meses dentro del condicional', () => {
    // Lo que se prueba aquí ocurre al compilar: dentro del `if`, TypeScript
    // sabe que la línea es mensual y deja leer `months` como `number`. Sin la
    // función, el mismo acceso no compila (ver el test de más abajo).
    if (isMonthlyLine(LINEA_MENSUAL)) {
      expect(LINEA_MENSUAL.months).toBe(6)
    } else {
      throw new Error('La línea mensual debería haber entrado en el if')
    }
  })
})

/*
 * GARANTÍAS DE TIPOS DE `BudgetLine`
 *
 * Mismo patrón que la garantía del catálogo en la Fase 2
 * (`shared/data/services.test.ts`): lo que se comprueba no ocurre al ejecutar
 * los tests, sino al compilar con `tsc -b`, que es parte de `npm run build`.
 *
 * El `@ts-expect-error` no silencia un problema: **es la comprobación**. Si
 * algún día el compilador dejara de rechazar la línea que tiene debajo, el
 * propio comentario pasaría a ser un error («unused directive») y el build
 * fallaría. Es un test que no se puede quedar en verde por accidente.
 */
describe('garantías de tipos de BudgetLine', () => {
  it('no permite una línea mensual sin meses', () => {
    // @ts-expect-error Falta `months`, que es obligatorio en una línea
    // mensual. Esta es la garantía principal de la unión discriminada: una
    // línea inválida no llega a existir.
    const sinMeses: BudgetLine = { service: SEO, quantity: 1 }

    expect(sinMeses.service.payment).toBe('monthly')
  })

  /*
   * AQUÍ NO HAY UN TERCER TEST, Y ES UNA DECISIÓN
   *
   * Falta la garantía que parecería evidente: que una línea de pago único
   * **con** meses no compile. No está porque no se cumple, y no se cumple
   * porque es incompatible con la garantía de abajo. Medido en la Fase 4:
   *
   * - Declarando `months?: never` en los tipos no mensuales, escribir meses en
   *   una web corporativa se rechaza... y a cambio `linea.months` pasa a
   *   leerse en cualquier línea, como `number | undefined`.
   * - Sin declararlo, leer `linea.months` sin estrechar no compila, y a cambio
   *   un `months` sobrante en una línea de pago único pasa desapercibido.
   *
   * Se eligió lo segundo: las lecturas son muchas y están repartidas por los
   * componentes, y las escrituras pasan todas por `createBudgetLine`, que tiene
   * sus propios tests. Lo que sustituye a la garantía que falta es ese archivo,
   * no el compilador.
   */

  it('no deja leer los meses sin comprobar antes la forma de pago', () => {
    /*
     * La línea llega como **parámetro**, y eso es parte de la comprobación.
     * Con una variable local (`const l: BudgetLine = LINEA_MENSUAL`) este test
     * no probaría nada: TypeScript estrecha una variable al asignarle un valor,
     * así que la variable ya sería mensual y el acceso compilaría con razón.
     * Un parámetro no se estrecha, y es además la situación real: los
     * componentes reciben las líneas, no las declaran.
     */
    function leerMeses(line: BudgetLine): unknown {
      // @ts-expect-error Sin pasar por `isMonthlyLine`, el compilador no sabe
      // si esta línea tiene meses. Es lo que obliga a comprobar antes de leer,
      // en lugar de inventar un valor de reserva.
      return line.months
    }

    expect(leerMeses(LINEA_MENSUAL)).toBe(6)
  })
})
