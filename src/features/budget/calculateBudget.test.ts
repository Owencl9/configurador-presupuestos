import { describe, expect, it } from 'vitest'

import { IGIC_RATE_PERCENT } from '../../shared/constants/business-rules'
import { SERVICES } from '../../shared/data/services'
import type {
  Budget,
  BudgetLine,
  PaymentBlock,
} from '../../shared/types/budget'
import type {
  MonthlyService,
  OneTimeService,
  Service,
  YearlyService,
} from '../../shared/types/service'
import { calculateBudget } from './calculateBudget'
import { calculateFirstPaymentCents } from './calculateFirstPaymentCents'

const TIENDA: OneTimeService = {
  id: 'tienda',
  name: 'Tienda de ejemplo',
  description: 'Solo para los tests.',
  category: 'web-design',
  priceCents: 250_000, // 2.500,00 €
  payment: 'one-time',
}

const SEO: MonthlyService = {
  id: 'seo',
  name: 'SEO de ejemplo',
  description: 'Solo para los tests.',
  category: 'marketing',
  priceCents: 25_000, // 250,00 €/mes
  payment: 'monthly',
  minMonths: 6,
}

const HOSTING: YearlyService = {
  id: 'hosting',
  name: 'Hosting de ejemplo',
  description: 'Solo para los tests.',
  category: 'infrastructure',
  priceCents: 12_000, // 120,00 €/año
  payment: 'yearly',
}

/**
 * Atajo para escribir una línea de presupuesto en los tests. Desde la Fase 4
 * una línea mensual lleva meses obligatoriamente; se ponen los mínimos del
 * servicio si no se indican otros. Ninguna de las nueve comprobaciones de este
 * archivo cambió al crecer el tipo.
 *
 * El tercer parámetro llega en la Fase 6: el descuento por permanencia necesita
 * líneas de doce meses, y hasta ahora todas nacían con el mínimo del servicio.
 */
function linea(
  service: BudgetLine['service'],
  quantity = 1,
  months?: number,
): BudgetLine {
  switch (service.payment) {
    case 'monthly':
      return { service, quantity, months: months ?? service.minMonths }
    case 'one-time':
      return { service, quantity }
    case 'yearly':
      return { service, quantity }
  }
}

/**
 * Busca un servicio **del catálogo real** por su identificador.
 *
 * El resto de este archivo usa servicios inventados a propósito, para no
 * depender de las tarifas. Los tres ejemplos del usuario son la excepción
 * deliberada: nombran servicios concretos del catálogo y sus cifras son las que
 * aparecen en la documentación de la fase y en el ADR, así que tienen que
 * calcularse con los precios de verdad. Si mañana cambia un precio, estos tres
 * tests fallan, y eso es exactamente lo que se quiere: avisan de que hay
 * documentación que ya no dice la verdad.
 */
/**
 * Los tres bloques con su nombre, para recorrerlos comprobando una invariante.
 *
 * Se escribe a mano en lugar de usar `Object.entries(presupuesto)` porque esa
 * función no conserva el tipo de los valores —devuelve `any`—, y entonces el
 * compilador no comprueba nada de lo que se escriba dentro del bucle. El
 * nombre, además, acaba en el mensaje de fallo: dice **qué bloque** ha
 * incumplido la invariante en lugar de solo que alguno lo ha hecho.
 */
function bloquesConNombre(
  presupuesto: Budget,
): readonly (readonly [string, PaymentBlock])[] {
  return [
    ['pago inicial', presupuesto.oneTime],
    ['cuota mensual', presupuesto.monthly],
    ['pago anual', presupuesto.yearly],
  ]
}

function servicioDelCatalogo(id: string): Service {
  const service = SERVICES.find((candidato) => candidato.id === id)

  if (service === undefined) {
    throw new Error(`El catálogo no tiene ningún servicio con el id «${id}».`)
  }

  return service
}

/*
 * El tipo de IGIC se pasa explícito (7) en los tests que comprueban importes,
 * para que cambiar la configuración del proyecto no rompa tests que no hablan
 * de configuración. Hay un test aparte que comprueba que el valor por defecto
 * es el configurado.
 */
describe('calculateBudget', () => {
  it('devuelve los tres bloques a cero con un presupuesto vacío', () => {
    const presupuesto = calculateBudget([], 7)

    for (const bloque of [
      presupuesto.oneTime,
      presupuesto.monthly,
      presupuesto.yearly,
    ]) {
      /*
       * `discounts` es el campo que añadió la Fase 6. Los importes de este test
       * no han cambiado —un presupuesto vacío sigue valiendo cero en todo—,
       * pero `toEqual` compara el objeto completo, así que el campo nuevo tiene
       * que estar escrito aquí.
       */
      expect(bloque).toEqual({
        subtotalCents: 0,
        discountCents: 0,
        discounts: [],
        taxableBaseCents: 0,
        igicCents: 0,
        totalCents: 0,
      })
    }
  })

  it('sigue el orden de cálculo del apartado 4.3 en un bloque', () => {
    /*
     * subtotal → descuentos → base imponible → IGIC → total.
     * 1.200,00 € + 7 % = 1.284,00 €.
     *
     * Un solo servicio: no hay pack —hacen falta tres— ni descuento por
     * importe, porque 1.200 € no superan los 3.000 €. **Los importes son los
     * mismos que antes de la Fase 6**; lo único que se añade es el campo
     * `discounts`, vacío, que `toEqual` exige escribir porque compara el objeto
     * completo.
     */
    const presupuesto = calculateBudget(
      [linea({ ...TIENDA, priceCents: 120_000 })],
      7,
    )

    expect(presupuesto.oneTime).toEqual({
      subtotalCents: 120_000,
      discountCents: 0,
      discounts: [],
      taxableBaseCents: 120_000,
      igicCents: 8_400,
      totalCents: 128_400,
    })
  })

  it('calcula los tres bloques de un presupuesto mixto', () => {
    /*
     * El ejemplo completo: 2.500 € de tienda, 250 €/mes de SEO a seis meses y
     * 120 €/año de hosting. Tres pagos en tres momentos distintos, cada uno con
     * su IGIC y su total.
     *
     * **Las cifras de este test cambiaron en la Fase 6**, y es uno de los dos
     * casos del archivo que lo hicieron. El motivo: son tres servicios
     * distintos, así que ahora el presupuesto lleva el 5 % de descuento por
     * pack en los tres bloques. Los seis meses del SEO no llegan a la
     * permanencia y los 2.500 € no superan el umbral del descuento por importe,
     * así que el pack es el único descuento. Comprobado a mano:
     *
     *   Pago inicial   2.500,00 € − 125,00 € = 2.375,00 € + 166,25 € = 2.541,25 €
     *   Cuota mensual    250,00 € −  12,50 € =   237,50 € +  16,63 € =   254,13 €/mes
     *   Pago anual       120,00 € −   6,00 € =   114,00 € +   7,98 € =   121,98 €/año
     *
     * Antes de la Fase 6 eran 2.675,00 €, 267,50 €/mes y 128,40 €/año: los
     * mismos subtotales sin descontar nada.
     */
    const presupuesto = calculateBudget(
      [linea(TIENDA), linea(SEO), linea(HOSTING)],
      7,
    )

    expect(presupuesto.oneTime.igicCents).toBe(16_625)
    expect(presupuesto.oneTime.totalCents).toBe(254_125)
    expect(presupuesto.monthly.igicCents).toBe(1_663)
    expect(presupuesto.monthly.totalCents).toBe(25_413)
    expect(presupuesto.yearly.igicCents).toBe(798)
    expect(presupuesto.yearly.totalCents).toBe(12_198)
  })

  it('aplica a cada bloque el IGIC de su propia base, no el de la suma', () => {
    /*
     * Si el cálculo mezclara los tres bloques, el IGIC de la cuota mensual
     * saldría de 2.870 € en lugar de 250 €, y la cuota mensual del cliente
     * incluiría el impuesto de la tienda que paga una sola vez.
     *
     * **La cifra esperada cambió en la Fase 6; lo que comprueba el test, no.**
     * Antes era el 7 % de los 250,00 € del SEO. Ahora los tres servicios
     * distintos activan el pack, así que la base de la cuota mensual es
     * 250,00 € − 12,50 € = 237,50 €, y su 7 % son 16,625 €, que el redondeo
     * comercial sube a 16,63 €.
     *
     * Se escribe el número y no la fórmula a propósito: calcularlo a partir de
     * `presupuesto.monthly.taxableBaseCents` sería una tautología —pasaría
     * incluso si la base estuviera mal— y lo que este test vigila es
     * precisamente de dónde sale la base.
     */
    const presupuesto = calculateBudget(
      [linea(TIENDA), linea(SEO), linea(HOSTING)],
      7,
    )

    expect(presupuesto.monthly.igicCents).toBe(1_663)
  })

  it('aplica el IGIC una sola vez sobre la base, no línea a línea', () => {
    /*
     * Siete líneas de 0,07 €. El 7 % de cada línea redondeado es 0, así que
     * sumar los redondeos daría 0 céntimos de IGIC. El 7 % de la base completa
     * (0,49 €) son 3 céntimos. La suma de redondeos no es el redondeo de la
     * suma, y este test fija cuál de las dos cosas hace la aplicación.
     *
     * **Nota de la Fase 6:** siete servicios distintos activan el pack, así que
     * este presupuesto sí lleva descuento: el 5 % de 0,49 € son 0,0245 €, que
     * redondean a 2 céntimos. La base pasa a ser de 47 céntimos y su 7 % son
     * 3,29 céntimos, que siguen redondeando a 3. Las dos cifras que comprueba
     * el test no han cambiado, pero **no es porque el descuento no actúe**, y
     * conviene que quien lea esto no lo deduzca.
     */
    const céntimoSuelto: OneTimeService = { ...TIENDA, priceCents: 7 }
    const presupuesto = calculateBudget(
      Array.from({ length: 7 }, (_, i) =>
        linea({ ...céntimoSuelto, id: `c${i}` }),
      ),
      7,
    )

    expect(presupuesto.oneTime.subtotalCents).toBe(49)
    expect(presupuesto.oneTime.igicCents).toBe(3)
  })

  it('no aplica ningún descuento cuando ninguna regla se cumple', () => {
    /*
     * Dos servicios distintos (el pack pide tres), 2.500 € de pago inicial (el
     * descuento por importe pide más de 3.000 €) y seis meses de SEO (la
     * permanencia pide doce). Ninguna regla se cumple, así que la base
     * imponible coincide con el subtotal.
     *
     * **Este test no ha cambiado de importes en la Fase 6, solo de nombre.**
     * Se llamaba «no aplica ningún descuento todavía», porque describía el
     * hueco vacío que la Fase 3 dejó para esta fase. Ahora los descuentos
     * existen y lo que el test describe es otra cosa: que cuando no se cumplen,
     * no se aplican.
     */
    const presupuesto = calculateBudget([linea(TIENDA), linea(SEO)], 7)

    expect(presupuesto.oneTime.discountCents).toBe(0)
    expect(presupuesto.oneTime.taxableBaseCents).toBe(
      presupuesto.oneTime.subtotalCents,
    )
  })

  it('mantiene las dos igualdades del desglose en los tres bloques', () => {
    /*
     * Las invariantes del presupuesto, comprobadas como tales y no sobre un
     * importe concreto: la base es el subtotal menos el descuento, y el total
     * es la base más el IGIC. Cuando la Fase 6 escriba un descuento distinto de
     * cero, este test seguirá describiendo lo que tiene que cumplirse.
     */
    const presupuesto = calculateBudget(
      [linea(TIENDA, 2), linea(SEO, 3), linea(HOSTING)],
      7,
    )

    for (const [nombre, bloque] of Object.entries(presupuesto)) {
      expect(bloque.taxableBaseCents, nombre).toBe(
        bloque.subtotalCents - bloque.discountCents,
      )
      expect(bloque.totalCents, nombre).toBe(
        bloque.taxableBaseCents + bloque.igicCents,
      )
    }
  })

  it('usa el tipo de IGIC configurado cuando no se le indica otro', () => {
    // La configurabilidad que pide el apartado 4.3: el valor real entra en el
    // cálculo por un único sitio, el archivo de constantes.
    const presupuesto = calculateBudget([linea(TIENDA)])

    expect(presupuesto.oneTime.igicCents).toBe(
      Math.round((TIENDA.priceCents * IGIC_RATE_PERCENT) / 100),
    )
  })

  it('admite un tipo de IGIC distinto del configurado', () => {
    const exento = calculateBudget([linea(TIENDA)], 0)

    expect(exento.oneTime.igicCents).toBe(0)
    expect(exento.oneTime.totalCents).toBe(250_000)
  })

  /* ---------------------------------------------------------------------------
   * Los tres ejemplos que el usuario calculó a mano al abrir la Fase 6.
   *
   * Son la especificación de esta fase en forma de test: llegaron antes de que
   * existiera una sola línea de código de descuentos, con los importes de cada
   * bloque y del primer día ya calculados. Van contra el catálogo real y con el
   * IGIC al 7 %.
   * ------------------------------------------------------------------------ */
  describe('los tres ejemplos calculados a mano', () => {
    const TIENDA_ONLINE = servicioDelCatalogo('online-store') // 2.500,00 €
    const SEO_PROFESIONAL = servicioDelCatalogo('seo-professional') // 450,00 €/mes
    const HOSTING_DOMINIO = servicioDelCatalogo('hosting-domain') // 120,00 €/año
    const WEB_CORPORATIVA = servicioDelCatalogo('corporate-website') // 1.200,00 €

    it('ejemplo 1: tienda online, SEO Profesional a 12 meses y hosting', () => {
      /*
       * Tres servicios distintos, así que hay pack en los tres bloques, y el
       * SEO llega a los 12 meses, así que la cuota mensual lleva además la
       * permanencia. El pago inicial no supera los 3.000 €, así que no hay
       * descuento por importe.
       *
       *   Pago inicial   2.500,00 € − 125,00 € (5 %)  = 2.375,00 € + 166,25 € = 2.541,25 €
       *   Cuota mensual    450,00 € −  22,50 € (5 %)
       *                             −  45,00 € (10 %) =   382,50 € +  26,78 € =   409,28 €/mes
       *   Pago anual       120,00 € −   6,00 € (5 %)  =   114,00 € +   7,98 € =   121,98 €/año
       *
       * El IGIC de la cuota mensual es un **empate de medio céntimo**: el 7 %
       * de 382,50 € son 26,775 €. El redondeo comercial del ADR 0007 lo sube a
       * 26,78 €, y la cifra que el usuario calculó a mano coincide.
       */
      const presupuesto = calculateBudget(
        [
          linea(TIENDA_ONLINE),
          linea(SEO_PROFESIONAL, 1, 12),
          linea(HOSTING_DOMINIO),
        ],
        7,
      )

      expect(presupuesto.oneTime).toMatchObject({
        subtotalCents: 250_000,
        discountCents: 12_500,
        taxableBaseCents: 237_500,
        igicCents: 16_625,
        totalCents: 254_125,
      })

      expect(presupuesto.monthly).toMatchObject({
        subtotalCents: 45_000,
        discountCents: 6_750,
        taxableBaseCents: 38_250,
        igicCents: 2_678,
        totalCents: 40_928,
      })

      expect(presupuesto.yearly).toMatchObject({
        subtotalCents: 12_000,
        discountCents: 600,
        taxableBaseCents: 11_400,
        igicCents: 798,
        totalCents: 12_198,
      })

      // 2.541,25 € + 409,28 € + 121,98 €. No es un total del presupuesto: es
      // lo que coincide el primer día (ADR 0008).
      expect(calculateFirstPaymentCents(presupuesto)).toBe(307_251)
    })

    it('ejemplo 1: la cuota mensual explica sus dos descuentos', () => {
      /*
       * El bloque donde coinciden dos reglas, que es el que demuestra que los
       * descuentos **se suman y no se encadenan**: 22,50 € + 45,00 € = 67,50 €.
       * Encadenados darían 65,25 €.
       */
      const presupuesto = calculateBudget(
        [
          linea(TIENDA_ONLINE),
          linea(SEO_PROFESIONAL, 1, 12),
          linea(HOSTING_DOMINIO),
        ],
        7,
      )

      expect(
        presupuesto.monthly.discounts.map(({ id, amountCents }) => [
          id,
          amountCents,
        ]),
      ).toEqual([
        ['pack', 2_250],
        ['commitment', 4_500],
      ])
    })

    it('ejemplo 2: el mismo presupuesto con el SEO a 6 meses', () => {
      /*
       * Un solo cambio respecto al ejemplo 1 —seis meses en lugar de doce— y
       * desaparece la permanencia. La cuota mensual sube de 409,28 € a
       * 457,43 €: el 10 % de la cuota, 45,00 €, más su IGIC.
       *
       *   Cuota mensual  450,00 € − 22,50 € (5 %) = 427,50 € + 29,93 € = 457,43 €/mes
       *
       * Otro empate de medio céntimo en el IGIC: el 7 % de 427,50 € son
       * 29,925 €.
       */
      const presupuesto = calculateBudget(
        [
          linea(TIENDA_ONLINE),
          linea(SEO_PROFESIONAL, 1, 6),
          linea(HOSTING_DOMINIO),
        ],
        7,
      )

      expect(presupuesto.monthly).toMatchObject({
        subtotalCents: 45_000,
        discountCents: 2_250,
        taxableBaseCents: 42_750,
        igicCents: 2_993,
        totalCents: 45_743,
      })

      expect(presupuesto.monthly.discounts.map(({ id }) => id)).toEqual([
        'pack',
      ])
    })

    it('ejemplo 3: tienda online y web corporativa, sin pack', () => {
      /*
       * **Dos** servicios distintos: no hay pack, aunque el importe sea el más
       * alto de los tres ejemplos. Es la regla que el usuario fijó
       * expresamente —el pack cuenta servicios, no dinero— y aquí se ve que las
       * dos reglas son independientes: sin pack, pero con descuento por importe,
       * porque 3.700,00 € superan los 3.000 €.
       *
       *   Pago inicial  3.700,00 € − 185,00 € (5 %) = 3.515,00 € + 246,05 € = 3.761,05 €
       */
      const presupuesto = calculateBudget(
        [linea(TIENDA_ONLINE), linea(WEB_CORPORATIVA)],
        7,
      )

      expect(presupuesto.oneTime).toMatchObject({
        subtotalCents: 370_000,
        discountCents: 18_500,
        taxableBaseCents: 351_500,
        igicCents: 24_605,
        totalCents: 376_105,
      })

      expect(presupuesto.oneTime.discounts.map(({ id }) => id)).toEqual([
        'amount',
      ])
    })
  })

  describe('el descuento de cada bloque', () => {
    it('es siempre la suma de los motivos que lo explican', () => {
      /*
       * La invariante que hace que el resumen no pueda mentir: lo que se resta
       * es exactamente la suma de las filas que se muestran. Si alguna vez un
       * descuento se calculara por un lado y su explicación por otro, este test
       * lo diría.
       */
      const presupuesto = calculateBudget(
        [linea(TIENDA, 2), linea(SEO, 3, 12), linea(HOSTING)],
        7,
      )

      for (const [nombre, bloque] of bloquesConNombre(presupuesto)) {
        let sumaDeMotivos = 0

        for (const { amountCents } of bloque.discounts) {
          sumaDeMotivos += amountCents
        }

        expect(sumaDeMotivos, nombre).toBe(bloque.discountCents)
      }
    })

    it('no deja ningún motivo sin texto que lo explique', () => {
      // El apartado 4.4 del prompt maestro pide los descuentos «explicando el
      // motivo de cada uno». Un importe sin motivo sería media regla.
      const presupuesto = calculateBudget(
        [linea(TIENDA), linea(SEO, 1, 12), linea(HOSTING)],
        7,
      )

      for (const [nombre, bloque] of bloquesConNombre(presupuesto)) {
        for (const descuento of bloque.discounts) {
          expect(descuento.label.length, nombre).toBeGreaterThan(0)
          expect(descuento.amountCents, nombre).not.toBe(0)
        }
      }
    })

    it('está vacío cuando ninguna regla se cumple', () => {
      // Dos servicios, 2.500,00 € y seis meses: ni pack, ni permanencia, ni
      // importe. El presupuesto no lleva ninguna fila de descuento.
      const presupuesto = calculateBudget([linea(TIENDA), linea(SEO)], 7)

      expect(presupuesto.oneTime.discounts).toEqual([])
      expect(presupuesto.monthly.discounts).toEqual([])
      expect(presupuesto.yearly.discounts).toEqual([])
    })
  })
})
