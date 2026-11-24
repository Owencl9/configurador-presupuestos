import { describe, expect, it } from 'vitest'

import {
  AMOUNT_DISCOUNT_THRESHOLD_CENTS,
  MAX_MONTHS,
} from '../constants/business-rules'
import type { Service } from '../types/service'
import { CATEGORIES, SERVICES } from './services'

/**
 * Tests de integridad del catálogo.
 *
 * No prueban una función, sino los *datos*. El apartado 4.1 del prompt maestro
 * pide que los servicios estén «en un archivo de datos del proyecto, fácil de
 * editar sin tocar la lógica». Eso significa que alguien editará ese archivo a
 * mano, probablemente con prisa, y que una `id` repetida o un precio en euros
 * en lugar de céntimos no darían ningún error visible: darían un presupuesto
 * mal calculado. Estos tests convierten esos descuidos en un fallo inmediato.
 */
describe('catálogo de servicios', () => {
  it('contiene los doce servicios acordados', () => {
    expect(SERVICES).toHaveLength(12)
  })

  it('declara las cuatro categorías acordadas', () => {
    expect(CATEGORIES.map((categoria) => categoria.id)).toEqual([
      'web-design',
      'marketing',
      'maintenance',
      'infrastructure',
    ])
  })

  it('no repite ningún identificador de servicio', () => {
    const identificadores = SERVICES.map((servicio) => servicio.id)
    const distintos = new Set(identificadores)

    // Los identificadores son la clave del servicio dentro del presupuesto. Si
    // hubiera dos iguales, quitar uno quitaría el otro.
    expect(distintos.size).toBe(identificadores.length)
  })

  it('no repite ningún nombre de servicio', () => {
    const nombres = SERVICES.map((servicio) => servicio.name)

    // Dos servicios con el mismo nombre serían indistinguibles en pantalla y
    // romperían las búsquedas por texto de los tests y de Playwright.
    expect(new Set(nombres).size).toBe(nombres.length)
  })

  it('expresa todos los precios como un número entero de céntimos positivo', () => {
    for (const servicio of SERVICES) {
      // Un precio con decimales significa que alguien ha escrito euros donde
      // van céntimos (ADR 0003). 1200.5 no es un importe válido en céntimos.
      expect(Number.isInteger(servicio.priceCents)).toBe(true)
      expect(servicio.priceCents).toBeGreaterThan(0)
    }
  })

  it('asigna a cada servicio una de las categorías declaradas', () => {
    const declaradas = CATEGORIES.map((categoria) => categoria.id)

    for (const servicio of SERVICES) {
      expect(declaradas).toContain(servicio.category)
    }
  })

  it('no deja ninguna categoría declarada sin servicios', () => {
    for (const categoria of CATEGORIES) {
      const servicios = SERVICES.filter(
        (servicio) => servicio.category === categoria.id,
      )

      // Una categoría vacía dejaría un encabezado suelto en pantalla.
      expect(servicios.length).toBeGreaterThan(0)
    }
  })

  it('da a cada servicio mensual un mínimo de meses entero y de al menos un mes', () => {
    const mensuales = SERVICES.filter(
      (servicio) => servicio.payment === 'monthly',
    )

    expect(mensuales.length).toBeGreaterThan(0)

    for (const servicio of mensuales) {
      // `servicio.minMonths` solo es accesible aquí porque el `filter` de
      // arriba ha dejado a TypeScript seguro de que son mensuales. Esa es la
      // unión discriminada funcionando.
      expect(Number.isInteger(servicio.minMonths)).toBe(true)
      expect(servicio.minMonths).toBeGreaterThanOrEqual(1)
    }
  })

  it('no da a ningún servicio mensual un mínimo por encima del tope de meses', () => {
    /*
     * El catálogo y el tope del selector se editan en archivos distintos, y
     * nada obliga a mirar uno al cambiar el otro. Un servicio con un mínimo de
     * 48 meses y un tope de 36 sería imposible de añadir al presupuesto: el
     * selector nacería con un valor que su propio máximo no admite.
     *
     * El mensaje nombra el servicio, para que el fallo diga cuál hay que
     * arreglar en lugar de solo que hay uno.
     */
    const mensuales = SERVICES.filter(
      (servicio) => servicio.payment === 'monthly',
    )

    for (const servicio of mensuales) {
      expect(
        servicio.minMonths,
        `«${servicio.name}» exige más meses de los que el selector permite elegir`,
      ).toBeLessThanOrEqual(MAX_MONTHS)
    }
  })

  it('incluye las tres formas de pago, para poder probar el desglose del resumen', () => {
    const formas = new Set(SERVICES.map((servicio) => servicio.payment))

    // El apartado 4.4 pide separar pago inicial, cuota mensual y pagos
    // anuales. Si el catálogo no tuviera las tres, el resumen de la Fase 4 no
    // se podría probar de verdad.
    expect(formas).toEqual(new Set(['one-time', 'monthly', 'yearly']))
  })

  it('permite superar el umbral de pago único que exige el descuento por importe', () => {
    const totalPagoUnico = SERVICES.filter(
      (servicio) => servicio.payment === 'one-time',
    ).reduce((suma, servicio) => suma + servicio.priceCents, 0)

    // El descuento por importe del apartado 4.3 se aplica cuando el pago único
    // supera el umbral. Si una futura edición del catálogo bajara los precios,
    // ese descuento pasaría a ser inalcanzable y los tests de la Fase 6
    // fallarían sin que estuviera claro por qué. Este test lo señala aquí.
    //
    // El umbral se lee de las constantes y no se escribe como literal: desde la
    // Fase 3 el valor vive en un único archivo, así que subirlo a 5.000 € tiene
    // que hacer fallar este test, no dejarlo comprobando una cifra antigua.
    expect(totalPagoUnico).toBeGreaterThan(AMOUNT_DISCOUNT_THRESHOLD_CENTS)
  })

  it('no permite declarar meses mínimos en un servicio que no es mensual', () => {
    const servicioImposible: Service = {
      id: 'imposible',
      name: 'Servicio imposible',
      description: 'Solo existe dentro de este test.',
      category: 'infrastructure',
      priceCents: 12_000,
      payment: 'yearly',
      // @ts-expect-error Los meses mínimos solo existen en los servicios
      // mensuales: `minMonths` no forma parte de `YearlyService`. Este
      // comentario no silencia un problema, es la comprobación en sí. Si algún
      // día el compilador dejara de rechazar esta línea, el propio
      // `@ts-expect-error` pasaría a ser un error y `npm run build` fallaría.
      minMonths: 6,
    }

    // Esta comprobación en tiempo de ejecución es casi una formalidad: lo que
    // de verdad se está probando ocurre al compilar, con `tsc -b`. Se deja
    // dentro de un test para que quede junto al resto de garantías del
    // catálogo y no en un archivo aparte que nadie vuelve a mirar.
    expect(servicioImposible.payment).toBe('yearly')
  })
})
