import { expect, test } from '@playwright/test'

import {
  BLOQUES,
  CIFRAS,
  DOCUMENTO,
  FECHA_FIJA,
  montarEjemplo,
} from './exampleBudget'
import { ConfiguratorPage } from './pages/ConfiguratorPage'
import { DocumentPage } from './pages/DocumentPage'

/**
 * Recorrido 3 — El documento con el medio de impresión emulado.
 *
 * ## Por qué este test es el que más aporta de los cinco
 *
 * Porque es el único que comprueba algo que **hoy no comprueba nada
 * automático**. El CSS de impresión de la Fase 7 no se puede probar con Vitest:
 * jsdom no aplica `@media print`, así que lo máximo que podían hacer sus tests
 * era verificar que los elementos llevan la clase `no-print` puesta —no que esa
 * clase los oculte de verdad al imprimir—. Lo que sostenía esa parte era la
 * comprobación visual del usuario con `Ctrl+P`.
 *
 * `emulateMedia({ media: 'print' })` le dice al navegador que se comporte como
 * si estuviera imprimiendo, y entonces las reglas de `@media print` se aplican
 * de verdad.
 *
 * ## El control que hace válida la comprobación
 *
 * Una afirmación de «no aparece» que no sepa decir «aparece» no prueba nada:
 * pasaría igual con la página en blanco, con un localizador mal escrito o con
 * el documento sin cargar. Así que cada elemento que debe desaparecer se
 * comprueba **visible antes** de emular la impresión, y lo que debe seguir
 * imprimiéndose se comprueba visible **también después**.
 */
test.describe('El documento en modo impresión', () => {
  test('los botones y la nota no se imprimen, y el presupuesto sí', async ({
    page,
  }) => {
    await page.clock.setFixedTime(FECHA_FIJA)

    const configurador = new ConfiguratorPage(page)
    const documento = new DocumentPage(page)

    await configurador.goto()
    await montarEjemplo(configurador)

    await configurador.rellenarCliente({ nombre: 'Ana Pérez' })
    await configurador.prepararDocumento()

    await expect(documento.titulo(DOCUMENTO.numero)).toBeVisible()

    /* ------------------------------------------------------------------------
     * Lo que no tiene que salir impreso, visible en pantalla.
     *
     * Este bloque es la mitad que hace válida la otra.
     * --------------------------------------------------------------------- */
    await expect(documento.botonImprimir).toBeVisible()
    await expect(documento.botonVolver).toBeVisible()
    await expect(documento.notaNumeracion).toBeVisible()

    /* ------------------------------------------------------------------------
     * Se emula la impresión.
     * --------------------------------------------------------------------- */
    await page.emulateMedia({ media: 'print' })

    // Los dos botones desaparecen. Es lo que impide que un presupuesto enviado
    // a un cliente lleve impreso un botón de «Imprimir o guardar en PDF».
    await expect(documento.botonImprimir).toBeHidden()
    await expect(documento.botonVolver).toBeHidden()

    // Y la nota de la numeración también: un cliente no tiene por qué leer que
    // su número de presupuesto puede estar repetido (decisión de la Fase 7).
    await expect(documento.notaNumeracion).toBeHidden()

    /* ------------------------------------------------------------------------
     * Lo que sí se imprime, que es el presupuesto entero.
     * --------------------------------------------------------------------- */
    await expect(documento.titulo(DOCUMENTO.numero)).toBeVisible()
    await expect(documento.fechaEmision(DOCUMENTO.emision)).toBeVisible()
    await expect(
      documento.validez(DOCUMENTO.diasDeValidez, DOCUMENTO.validoHasta),
    ).toBeVisible()

    await expect(page.getByText('Ana Pérez', { exact: true })).toBeVisible()

    await expect(documento.fila(BLOQUES.pagoInicial, 'Total')).toHaveText(
      CIFRAS.pagoInicial.total,
    )
    await expect(documento.fila(BLOQUES.cuotaMensual, 'Total')).toHaveText(
      CIFRAS.cuotaMensual.total,
    )
    await expect(documento.fila(BLOQUES.pagoAnual, 'Total')).toHaveText(
      CIFRAS.pagoAnual.total,
    )

    // La línea del primer día se imprime a propósito, con su explicación
    // pegada debajo (ADR 0008): suelta, esa cifra parece el total que no es.
    await expect(documento.lineaPrimerPago).toBeVisible()
    await expect(documento.importePrimerPago).toHaveText(CIFRAS.primerDia)
    await expect(
      page.getByText('Incluye el pago inicial, la primera cuota mensual'),
    ).toBeVisible()

    // El aviso de que todo es ficticio tiene que salir impreso sobre todo
    // cuando el documento se imprime, que es cuando sale del navegador.
    await expect(documento.pie).toBeVisible()

    /* ------------------------------------------------------------------------
     * De vuelta a la pantalla.
     *
     * Cierra el lazo: lo que se ocultó vuelve, así que lo que se midió era el
     * medio de impresión y no un elemento que hubiera desaparecido por su
     * cuenta a mitad del test.
     * --------------------------------------------------------------------- */
    await page.emulateMedia({ media: 'screen' })

    await expect(documento.botonImprimir).toBeVisible()
    await expect(documento.botonVolver).toBeVisible()
    await expect(documento.notaNumeracion).toBeVisible()
  })
})
