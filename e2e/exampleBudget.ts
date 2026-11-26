import { expect } from '@playwright/test'

import type { ConfiguratorPage } from './pages/ConfiguratorPage'

/* =============================================================================
 * EL PRESUPUESTO DE EJEMPLO, Y LAS CIFRAS QUE TIENE QUE DAR
 * =============================================================================
 *
 * Es el «ejemplo 1» con el que el usuario ha ido probando la aplicación a mano
 * desde la Fase 4: Tienda online, SEO Profesional a doce meses y Hosting.
 *
 * Vive en un archivo aparte porque lo usan cuatro de los cinco recorridos, y
 * las cifras tienen que ser **las mismas en todos**: si un día el catálogo o
 * una regla cambian, lo que hay que actualizar está en un solo sitio y los
 * cuatro tests se ponen rojos a la vez, que es la señal correcta.
 *
 * El nombre del archivo no acaba en `.spec.ts`, así que Playwright no lo
 * confunde con un archivo de tests.
 *
 * ## De dónde salen las cifras
 *
 * | Bloque        | Subtotal   | Descuento  | Base       | IGIC 7 %  | Total          |
 * | ------------- | ---------- | ---------- | ---------- | --------- | -------------- |
 * | Pago inicial  | 2.500,00 € | −125,00 €  | 2.375,00 € | 166,25 €  | 2.541,25 €     |
 * | Cuota mensual |   450,00 € |  −67,50 €  |   382,50 € |  26,78 €  | 409,28 €/mes   |
 * | Pago anual    |   120,00 € |   −6,00 €  |   114,00 € |   7,98 €  | 121,98 €/año   |
 *
 * Los descuentos son el 5 % de pack —tres servicios distintos, aplicado a los
 * tres bloques— y el 10 % de permanencia sobre la cuota mensual, que son doce
 * meses. El descuento por importe **no** entra: 2.500 € no pasa de los 3.000 €
 * del umbral. Nada llega al tope del 20 %.
 * ========================================================================== */

/** Los tres servicios del ejemplo, con el nombre exacto del catálogo. */
export const SERVICIOS = {
  tienda: 'Tienda online',
  seo: 'SEO Profesional',
  hosting: 'Hosting y dominio',
} as const

/** Los meses que se contratan del servicio mensual, para llegar al descuento. */
export const MESES = 12

/** Lo que tiene que aparecer en pantalla y en el documento. */
export const CIFRAS = {
  pagoInicial: {
    subtotal: '2.500,00 €',
    descuento: '-125,00 €',
    base: '2.375,00 €',
    igic: '166,25 €',
    total: '2.541,25 €',
  },
  cuotaMensual: {
    subtotal: '450,00 €',
    descuento: '-67,50 €',
    base: '382,50 €',
    igic: '26,78 €',
    total: '409,28 €/mes',
  },
  pagoAnual: {
    subtotal: '120,00 €',
    descuento: '-6,00 €',
    base: '114,00 €',
    igic: '7,98 €',
    total: '121,98 €/año',
  },
  primerDia: '3.072,51 €',
} as const

/** Los títulos de los tres bloques, tal como se leen en pantalla. */
export const BLOQUES = {
  pagoInicial: 'Pago inicial',
  cuotaMensual: 'Cuota mensual',
  pagoAnual: 'Pago anual',
} as const

/* -----------------------------------------------------------------------------
 * LA FECHA, CONGELADA
 * -----------------------------------------------------------------------------
 *
 * El documento imprime la fecha de emisión, la validez a 30 días y un número
 * que lleva el año dentro. Con el reloj del sistema, un test que afirmara
 * `PRE-2026-0001` **dejaría de pasar el 1 de enero**, y el proyecto tiene la
 * norma de que ningún test dependa del día en que se ejecuta.
 *
 * Así que el reloj del navegador se congela con `page.clock.setFixedTime()`.
 * Se usa `setFixedTime` y no `install` a propósito: `setFixedTime` solo cambia
 * lo que devuelven `Date.now()` y `new Date()`, y **deja los temporizadores
 * corriendo**. `install` los falsea todos, y React los necesita para dibujar.
 *
 * La hora va en UTC (`Z`) y la zona horaria del navegador está fijada en
 * `playwright.config.ts` a la de Canarias, que el 10 de marzo está en UTC+0.
 * Así la fecha local del navegador es exactamente el 10/03/2026.
 * -------------------------------------------------------------------------- */

/** El instante en que se emiten los presupuestos de los tests. */
export const FECHA_FIJA = new Date('2026-03-10T09:00:00Z')

/** Lo que el documento tiene que llevar impreso con esa fecha. */
export const DOCUMENTO = {
  /** Primer presupuesto de un navegador limpio: la serie empieza en 0001. */
  numero: 'PRE-2026-0001',
  emision: '10/03/2026',
  diasDeValidez: 30,
  /** 30 días de calendario después del 10 de marzo. */
  validoHasta: '09/04/2026',
} as const

/**
 * Monta el presupuesto de ejemplo en el configurador y deja comprobado que las
 * tres cifras de pantalla son las esperadas.
 *
 * Incluye el cambio de meses de 6 a 12, que es lo que activa el descuento por
 * permanencia.
 */
export async function montarEjemplo(
  configurador: ConfiguratorPage,
): Promise<void> {
  await configurador.anadirServicio(SERVICIOS.tienda)
  await configurador.anadirServicio(SERVICIOS.seo)
  await configurador.anadirServicio(SERVICIOS.hosting)

  await configurador.cambiarMeses(SERVICIOS.seo, MESES)

  await expect(configurador.fila(BLOQUES.pagoInicial, 'Total')).toHaveText(
    CIFRAS.pagoInicial.total,
  )
  await expect(configurador.fila(BLOQUES.cuotaMensual, 'Total')).toHaveText(
    CIFRAS.cuotaMensual.total,
  )
  await expect(configurador.fila(BLOQUES.pagoAnual, 'Total')).toHaveText(
    CIFRAS.pagoAnual.total,
  )
}
