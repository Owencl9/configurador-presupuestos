import { describe, expect, it } from 'vitest'

import type {
  MonthlyService,
  OneTimeService,
  Service,
  YearlyService,
} from '../../shared/types/service'
import { buildPriceLabel } from './buildPriceLabel'

/*
 * Servicios de prueba. No se usa el catálogo real a propósito: si estos tests
 * dependieran de los precios de `services.ts`, cambiar una tarifa rompería
 * tests que no hablan de tarifas. Lo que se prueba aquí es el formato.
 */
const PAGO_UNICO: OneTimeService = {
  id: 'ejemplo-unico',
  name: 'Servicio de ejemplo',
  description: 'Solo para los tests.',
  category: 'web-design',
  priceCents: 120_000,
  payment: 'one-time',
}

const MENSUAL: MonthlyService = {
  id: 'ejemplo-mensual',
  name: 'Servicio de ejemplo',
  description: 'Solo para los tests.',
  category: 'marketing',
  priceCents: 25_000,
  payment: 'monthly',
  minMonths: 6,
}

const ANUAL: YearlyService = {
  id: 'ejemplo-anual',
  name: 'Servicio de ejemplo',
  description: 'Solo para los tests.',
  category: 'infrastructure',
  priceCents: 12_000,
  payment: 'yearly',
}

describe('buildPriceLabel', () => {
  it('muestra un pago único sin sufijo, en formato español', () => {
    expect(buildPriceLabel(PAGO_UNICO)).toBe('1.200,00 €')
  })

  it('añade «/mes» a un servicio mensual', () => {
    expect(buildPriceLabel(MENSUAL)).toBe('250,00 €/mes')
  })

  it('añade «/año» a un servicio anual', () => {
    expect(buildPriceLabel(ANUAL)).toBe('120,00 €/año')
  })

  /*
   * LAS REGLAS DE FORMATO, AGRUPADAS EN UNA TABLA (Fase 9)
   *
   * Estos cinco casos estaban escritos como cinco tests independientes, cada
   * uno con el nombre de la regla de formato que comprobaba («escribe siempre
   * los dos decimales», «rellena con un cero los céntimos de una sola
   * cifra»…). Y esos nombres habían dejado de ser verdad: desde la Fase 3
   * `buildPriceLabel` **no formatea nada**, llama a `formatEuros` y le añade el
   * sufijo. Las cinco reglas se prueban, con las mismas entradas y las mismas
   * salidas, en `formatEuros.test.ts`, que es donde viven.
   *
   * Lo detectó el informe de cobertura de la Fase 9 al buscar duplicados:
   * cuatro de los cinco casos eran **idénticos** —misma entrada, misma salida
   * esperada— a cuatro tests de `formatEuros`.
   *
   * No se ha borrado ningún caso: los cinco siguen ejecutándose, y por tanto
   * siguen contando como cinco tests. Lo que cambia es lo que afirman. Juntos y
   * con este título dicen una sola cosa, que es la que de verdad le toca a esta
   * función: **el formato lo delega, no lo reimplementa.** Si alguien volviera
   * a escribir aquí la conversión de céntimos a euros a mano, el duplicado
   * reaparecería y estos cinco casos lo seguirían cazando.
   */
  const CASOS_DE_FORMATO: {
    nombre: string
    servicio: Service
    esperado: string
  }[] = [
    {
      nombre: 'los dos decimales, aunque sean cero',
      servicio: { ...ANUAL, priceCents: 7_200 },
      esperado: '72,00 €/año',
    },
    {
      // Formato español (apartado 4.3 del prompt maestro): el punto agrupa
      // millares y la coma separa los decimales, al contrario que en inglés.
      nombre: 'los millares con punto y los decimales con coma',
      servicio: { ...PAGO_UNICO, priceCents: 1_234_567 },
      esperado: '12.345,67 €',
    },
    {
      nombre: 'los céntimos que no acaban en cero',
      servicio: { ...PAGO_UNICO, priceCents: 199_999 },
      esperado: '1.999,99 €',
    },
    {
      // 1.205 céntimos son 12,05 €, no 12,5 €. Es el error de redondeo más
      // fácil de cometer al convertir céntimos a euros a mano.
      nombre: 'el cero de relleno en un céntimo de una sola cifra',
      servicio: { ...PAGO_UNICO, priceCents: 1_205 },
      esperado: '12,05 €',
    },
    {
      nombre: 'el cero delante en un importe menor de un euro',
      servicio: { ...PAGO_UNICO, priceCents: 50 },
      esperado: '0,50 €',
    },
  ]

  it.each(CASOS_DE_FORMATO)(
    'delega el formato en formatEuros: $nombre',
    ({ servicio, esperado }) => {
      expect(buildPriceLabel(servicio)).toBe(esperado)
    },
  )
})
