import { describe, expect, it } from 'vitest'

import { MAX_TOTAL_DISCOUNT_PERCENT } from '../constants/business-rules'
import type { BudgetLine, MonthlyBudgetLine, Subtotals } from '../types/budget'
import {
  calculateDiscounts,
  DISCOUNT_STRATEGIES,
  sumDiscountCents,
} from './calculateDiscounts'
import type { DiscountStrategy } from './discountStrategy'

const TIENDA: BudgetLine = {
  quantity: 1,
  service: {
    id: 'tienda',
    name: 'Tienda de ejemplo',
    description: 'Solo para los tests.',
    category: 'web-design',
    priceCents: 250_000,
    payment: 'one-time',
  },
}

const SEO: MonthlyBudgetLine = {
  quantity: 1,
  months: 12,
  service: {
    id: 'seo',
    name: 'SEO de ejemplo',
    description: 'Solo para los tests.',
    category: 'marketing',
    priceCents: 45_000,
    payment: 'monthly',
    minMonths: 6,
  },
}

const HOSTING: BudgetLine = {
  quantity: 1,
  service: {
    id: 'hosting',
    name: 'Hosting de ejemplo',
    description: 'Solo para los tests.',
    category: 'infrastructure',
    priceCents: 12_000,
    payment: 'yearly',
  },
}

const WEB: BudgetLine = {
  quantity: 1,
  service: {
    id: 'web',
    name: 'Web de ejemplo',
    description: 'Solo para los tests.',
    category: 'web-design',
    priceCents: 120_000,
    payment: 'one-time',
  },
}

const MIGRACION: BudgetLine = {
  quantity: 1,
  service: {
    id: 'migracion',
    name: 'Migración de ejemplo',
    description: 'Solo para los tests.',
    category: 'infrastructure',
    priceCents: 30_000,
    payment: 'one-time',
  },
}

/**
 * Los subtotales de un contexto de test.
 *
 * Los subtotales que se pasen tienen que ser **coherentes con las líneas**, que
 * es lo que produce `calculateSubtotals` en la aplicación. Un contexto
 * incoherente —una línea mensual de 450,00 €/mes con el subtotal mensual a
 * cero— describe una situación que no puede ocurrir, y un test así no prueba
 * nada: lo que mide es el comportamiento del código ante una entrada
 * imposible. Ocurrió al escribir estos tests y se corrigió aquí.
 */
function subtotales(parciales: Partial<Subtotals> = {}): Subtotals {
  return { oneTimeCents: 0, monthlyCents: 0, yearlyCents: 0, ...parciales }
}

/** Los subtotales de un presupuesto de tienda + SEO a 12 meses + hosting. */
const SUBTOTALES_MIXTO = subtotales({
  oneTimeCents: 250_000,
  monthlyCents: 45_000,
  yearlyCents: 12_000,
})

/**
 * Para los tests del tope: ahí las líneas **no intervienen**.
 *
 * Las estrategias de prueba solo leen los subtotales, así que pasar un servicio
 * cualquiera haría pensar que el resultado depende de él. La lista vacía dice
 * lo que ocurre de verdad.
 */
const SIN_LINEAS: readonly BudgetLine[] = []

/**
 * Una estrategia de prueba que descuenta un porcentaje de un bloque, sin
 * ninguna condición.
 *
 * **Es lo que permite probar el tope del 20 %.** Con las reglas reales del
 * proyecto el tope no se alcanza nunca —como máximo se juntan un 15 % en la
 * cuota mensual—, así que comprobarlo exige estrategias que no existen en
 * producción. Es exactamente la ventaja que el
 * [ADR 0004](../../../docs/adr/0004-strategy-para-descuentos.md) esperaba del
 * patrón: *«se puede probar el tope del 20 % de forma aislada, combinando
 * descuentos que por separado sumarían más»*.
 */
function estrategiaDePrueba(
  id: string,
  percent: number,
  block: 'oneTime' | 'monthly' | 'yearly' = 'oneTime',
): DiscountStrategy {
  return ({ subtotalsCents }) => [
    {
      id,
      label: `Descuento de prueba del ${percent} %`,
      block,
      amountCents: Math.round((subtotalsCents[block] * percent) / 100),
    },
  ]
}

describe('sumDiscountCents', () => {
  it('suma cero sin descuentos', () => {
    expect(sumDiscountCents([])).toBe(0)
  })

  it('suma los importes de varios descuentos', () => {
    expect(
      sumDiscountCents([
        { id: 'a', label: 'A', amountCents: 1_250 },
        { id: 'b', label: 'B', amountCents: 4_500 },
      ]),
    ).toBe(5_750)
  })

  it('resta el ajuste negativo del tope', () => {
    // El ajuste del tope es el único descuento con importe negativo: devuelve
    // parte de lo descontado, y la suma tiene que reflejarlo.
    expect(
      sumDiscountCents([
        { id: 'a', label: 'A', amountCents: 1_000 },
        { id: 'cap', label: 'Tope', amountCents: -200 },
      ]),
    ).toBe(800)
  })
})

describe('calculateDiscounts', () => {
  it('no devuelve ningún descuento con un presupuesto vacío', () => {
    const descuentos = calculateDiscounts([], subtotales())

    expect(descuentos).toEqual({ oneTime: [], monthly: [], yearly: [] })
  })

  it('reparte cada descuento en el bloque que le corresponde', () => {
    /*
     * Tres servicios distintos, con el SEO a 12 meses. El pack cae en los tres
     * bloques; la permanencia, solo en el mensual.
     *
     * Pack:        5 % de 2.500,00 € = 125,00 €
     *              5 % de   450,00 € =  22,50 €
     *              5 % de   120,00 € =   6,00 €
     * Permanencia: 10 % de 450,00 €  =  45,00 €
     */
    const descuentos = calculateDiscounts(
      [TIENDA, SEO, HOSTING],
      SUBTOTALES_MIXTO,
    )

    expect(descuentos.oneTime).toEqual([
      { id: 'pack', label: expect.any(String), amountCents: 12_500 },
    ])
    expect(descuentos.monthly).toEqual([
      { id: 'pack', label: expect.any(String), amountCents: 2_250 },
      { id: 'commitment', label: expect.any(String), amountCents: 4_500 },
    ])
    expect(descuentos.yearly).toEqual([
      { id: 'pack', label: expect.any(String), amountCents: 600 },
    ])
  })

  it('no incluye el bloque en cada descuento devuelto', () => {
    /*
     * El bloque es la clave del resultado, así que repetirlo dentro de cada
     * descuento sería el mismo dato en dos sitios: el día que alguien mueva un
     * descuento de lista, el campo diría lo contrario que su clave. El
     * calculador lo quita al agrupar.
     */
    const descuentos = calculateDiscounts(
      [TIENDA, SEO, HOSTING],
      SUBTOTALES_MIXTO,
    )

    expect(descuentos.oneTime[0]).not.toHaveProperty('block')
  })

  it('suma los descuentos de un mismo bloque, no los encadena', () => {
    /*
     * **La decisión del usuario, fijada con números.** En la cuota mensual
     * coinciden el pack (5 %) y la permanencia (10 %) sobre 450,00 €:
     *
     *   sumados:     5 % + 10 % de 450,00 € = 22,50 € + 45,00 € = 67,50 €
     *   encadenados: 5 % de 450,00 € → 427,50 €, y 10 % de eso = 42,75 €,
     *                lo que daría 65,25 € en total
     *
     * Son 2,25 € de diferencia en una sola cuota. Los dos porcentajes se
     * calculan sobre el subtotal, siempre.
     */
    const descuentos = calculateDiscounts(
      [TIENDA, SEO, HOSTING],
      SUBTOTALES_MIXTO,
    )

    expect(sumDiscountCents(descuentos.monthly)).toBe(6_750)
  })

  it('no devuelve descuentos de importe cero', () => {
    /*
     * Tres servicios de pago único: 2.500 + 1.200 + 300 = 4.000,00 €. El
     * presupuesto no tiene cuota mensual ni pago anual, así que esos dos
     * bloques no llevan ningún descuento. Una fila de «0,00 €» en el resumen
     * parece un error de cálculo.
     */
    const descuentos = calculateDiscounts(
      [TIENDA, WEB, MIGRACION],
      subtotales({ oneTimeCents: 400_000 }),
    )

    expect(descuentos.oneTime).toHaveLength(2) // pack e importe
    expect(descuentos.monthly).toEqual([])
    expect(descuentos.yearly).toEqual([])
  })

  it('con las reglas reales no llega al tope en ningún bloque', () => {
    /*
     * **El test que vigila que el tope siga siendo inalcanzable en
     * producción**, y que avisa el día que deje de serlo. Con las reglas
     * actuales lo máximo que se junta en un bloque es un 15 % —pack más
     * permanencia en la cuota mensual—, así que el ajuste del tope no aparece
     * nunca.
     *
     * Si alguien sube un porcentaje y el tope empieza a morder de verdad, este
     * test falla y lo dice. No es un fallo del código: es un aviso de que la
     * documentación y las pantallas tienen que contar con un caso que hasta
     * ahora solo existía en los tests.
     */
    const descuentos = calculateDiscounts(
      [TIENDA, WEB, MIGRACION, SEO, HOSTING],
      subtotales({
        oneTimeCents: 400_000, // supera el umbral: pack + importe
        monthlyCents: 45_000, // pack + permanencia
        yearlyCents: 12_000, // pack
      }),
    )

    for (const [bloque, lista] of Object.entries(descuentos)) {
      expect(
        lista.map(({ id }) => id),
        bloque,
      ).not.toContain('cap')
    }
  })

  describe('el tope del descuento', () => {
    it('recorta la suma que supera el tope, con una estrategia de prueba', () => {
      /*
       * Dos estrategias de prueba del 15 % cada una suman el 30 % de
       * 1.000,00 €, es decir 300,00 €. El tope del 20 % deja el descuento en
       * 200,00 €.
       */
      const descuentos = calculateDiscounts(
        SIN_LINEAS,
        subtotales({ oneTimeCents: 100_000 }),
        [
          estrategiaDePrueba('prueba-a', 15),
          estrategiaDePrueba('prueba-b', 15),
        ],
      )

      expect(sumDiscountCents(descuentos.oneTime)).toBe(20_000)
    })

    it('añade el ajuste al final, con importe negativo y su motivo', () => {
      /*
       * Decisión del usuario: cada descuento conserva su importe honesto y el
       * recorte se ve como una fila de ajuste. Así ninguna etiqueta miente
       * —«15 %» sigue valiendo el 15 %— y la suma de lo que se muestra es
       * exactamente lo que se resta.
       *
       * 150,00 € + 150,00 € − 100,00 € = 200,00 €.
       */
      const descuentos = calculateDiscounts(
        SIN_LINEAS,
        subtotales({ oneTimeCents: 100_000 }),
        [
          estrategiaDePrueba('prueba-a', 15),
          estrategiaDePrueba('prueba-b', 15),
        ],
      )

      expect(descuentos.oneTime).toHaveLength(3)
      expect(descuentos.oneTime.at(-1)).toEqual({
        id: 'cap',
        label: `Tope del ${MAX_TOTAL_DISCOUNT_PERCENT} % del subtotal`,
        amountCents: -10_000,
      })
    })

    it('no añade ajuste cuando la suma coincide exactamente con el tope', () => {
      // Un 20 % justo no supera el tope. El ajuste solo aparece cuando hay algo
      // que recortar, y una fila de «0,00 €» no explica nada.
      const descuentos = calculateDiscounts(
        SIN_LINEAS,
        subtotales({ oneTimeCents: 100_000 }),
        [estrategiaDePrueba('prueba-a', MAX_TOTAL_DISCOUNT_PERCENT)],
      )

      expect(descuentos.oneTime).toHaveLength(1)
      expect(sumDiscountCents(descuentos.oneTime)).toBe(20_000)
    })

    it('trunca el tope hacia abajo con céntimos impares', () => {
      /*
       * **El tope se trunca, no se redondea**, y es la única operación del
       * proyecto que no usa el redondeo comercial. El 20 % de 9,99 € son
       * 1,998 €: redondeando daría 2,00 €, que es **más del 20 %**. Un tope que
       * se puede superar no es un tope.
       *
       * Una estrategia de prueba del 100 % pide descontarlo todo; el tope lo
       * deja en 199 céntimos.
       */
      const descuentos = calculateDiscounts(
        SIN_LINEAS,
        subtotales({ oneTimeCents: 999 }),
        [estrategiaDePrueba('prueba-todo', 100)],
      )

      expect(sumDiscountCents(descuentos.oneTime)).toBe(199)
    })

    it('aplica el tope a cada bloque por separado', () => {
      /*
       * Decisión del usuario: el tope es por bloque, igual que los descuentos.
       * Aquí la cuota mensual se pasa del tope y el pago inicial no, así que
       * solo la primera lleva ajuste.
       */
      const descuentos = calculateDiscounts(
        SIN_LINEAS,
        subtotales({ oneTimeCents: 100_000, monthlyCents: 100_000 }),
        [
          estrategiaDePrueba('prueba-inicial', 10, 'oneTime'),
          estrategiaDePrueba('prueba-mensual', 30, 'monthly'),
        ],
      )

      expect(sumDiscountCents(descuentos.oneTime)).toBe(10_000)
      expect(sumDiscountCents(descuentos.monthly)).toBe(20_000)
      expect(descuentos.oneTime.map(({ id }) => id)).not.toContain('cap')
      expect(descuentos.monthly.map(({ id }) => id)).toContain('cap')
    })

    it('nunca deja un descuento mayor que el subtotal', () => {
      /*
       * La consecuencia que importa de verdad: con el tope en el 20 %, la base
       * imponible nunca puede salir negativa. El aviso del
       * `calculateIgic` sobre `Math.round(-3.5)` depende de esto.
       */
      const subtotalCents = 100_000
      const descuentos = calculateDiscounts(
        SIN_LINEAS,
        subtotales({ oneTimeCents: subtotalCents }),
        [estrategiaDePrueba('prueba-todo', 500)],
      )

      expect(sumDiscountCents(descuentos.oneTime)).toBeLessThan(subtotalCents)
    })
  })

  it('usa las tres estrategias del proyecto cuando no se le indican otras', () => {
    // La lista por defecto es la de producción, y los tests del tope pasan otra
    // sin tener que tocar ninguna constante del proyecto.
    expect(DISCOUNT_STRATEGIES).toHaveLength(3)

    const porDefecto = calculateDiscounts(
      [TIENDA, SEO, HOSTING],
      SUBTOTALES_MIXTO,
    )
    const explícitas = calculateDiscounts(
      [TIENDA, SEO, HOSTING],
      SUBTOTALES_MIXTO,
      DISCOUNT_STRATEGIES,
    )

    expect(porDefecto).toEqual(explícitas)
  })
})
