import { expect, test } from './cspGuard'

import {
  BLOQUES,
  CIFRAS,
  DOCUMENTO,
  FECHA_FIJA,
  MESES,
  SERVICIOS,
} from './exampleBudget'
import { ConfiguratorPage } from './pages/ConfiguratorPage'
import { DocumentPage } from './pages/DocumentPage'

/**
 * Recorrido 1 — Del catálogo al documento, comprobando las cifras.
 *
 * Es el recorrido completo de la aplicación en un navegador real: elegir tres
 * servicios, ajustar la permanencia, ver el desglose con sus descuentos,
 * escribir los datos del cliente y obtener el documento.
 *
 * Lo que este test aporta sobre los 560 de Vitest no son las cifras —esas ya
 * están probadas una por una— sino que **la cadena entera se sostiene**: que lo
 * que calcula `calculateBudget` llega a la pantalla, sobrevive al paso por el
 * formulario y aparece igual en el documento, con clics y pulsaciones de teclas
 * de verdad sobre el paquete compilado que se despliega.
 */
test.describe('Recorrido completo del presupuesto', () => {
  test('tres servicios, doce meses de permanencia y el documento con sus cifras', async ({
    page,
  }) => {
    // Antes de cargar la página: el documento lee el reloj al emitirse.
    await page.clock.setFixedTime(FECHA_FIJA)

    const configurador = new ConfiguratorPage(page)
    const documento = new DocumentPage(page)

    await configurador.goto()

    // --- El presupuesto vacío ------------------------------------------------
    await expect(configurador.estado).toHaveText(
      'No hay servicios en el presupuesto.',
    )

    // --- Los tres servicios --------------------------------------------------
    await configurador.anadirServicio(SERVICIOS.tienda)
    await configurador.anadirServicio(SERVICIOS.seo)
    await configurador.anadirServicio(SERVICIOS.hosting)

    // El botón del catálogo pasa a estar «pulsado»: es lo que anuncia a un
    // lector de pantalla que el servicio ya está incluido, sin depender del
    // color.
    await expect(configurador.botonTarjeta(SERVICIOS.tienda)).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    // --- La permanencia -----------------------------------------------------
    //
    // La pista del selector de meses se comprueba a través de la **descripción
    // accesible** del campo, que es lo que se le anuncia a quien entra en él.
    // Comprobar el resultado y no la técnica es el mismo criterio que usan los
    // tests del formulario de la Fase 7.
    await expect(
      configurador.campoMeses(SERVICIOS.seo),
    ).toHaveAccessibleDescription(/Desde 12 meses: 10 % de descuento/)

    await configurador.cambiarMeses(SERVICIOS.seo, MESES)

    await expect(
      configurador.campoMeses(SERVICIOS.seo),
    ).toHaveAccessibleDescription(/Descuento por permanencia aplicado/)

    // --- El desglose en pantalla, fila por fila -----------------------------
    const esperado = [
      [BLOQUES.pagoInicial, CIFRAS.pagoInicial],
      [BLOQUES.cuotaMensual, CIFRAS.cuotaMensual],
      [BLOQUES.pagoAnual, CIFRAS.pagoAnual],
    ] as const

    for (const [bloque, cifras] of esperado) {
      await expect(configurador.fila(bloque, 'Subtotal')).toHaveText(
        cifras.subtotal,
      )
      await expect(configurador.fila(bloque, 'Descuento')).toHaveText(
        cifras.descuento,
      )
      await expect(configurador.fila(bloque, 'Base imponible')).toHaveText(
        cifras.base,
      )
      await expect(configurador.fila(bloque, 'IGIC (7 %)')).toHaveText(
        cifras.igic,
      )
      await expect(configurador.fila(bloque, 'Total')).toHaveText(cifras.total)
    }

    // El motivo de cada descuento, que es lo que pide el apartado 4.4 de la
    // especificación: no basta con restar, hay que decir por qué.
    await expect(configurador.bloque(BLOQUES.cuotaMensual)).toContainText(
      'Pack de 3 servicios o más (5 %)',
    )
    await expect(configurador.bloque(BLOQUES.cuotaMensual)).toContainText(
      'Permanencia de 12 meses o más (10 %)',
    )

    // --- La frase de estado -------------------------------------------------
    await expect(configurador.estado).toHaveText(
      `3 servicios en el presupuesto. A pagar el primer día (orientativo): ${CIFRAS.primerDia}`,
    )

    // --- Los datos del cliente ----------------------------------------------
    await configurador.rellenarCliente({
      nombre: 'Ana Pérez',
      empresa: 'Comercial del Norte',
      correo: 'ana@example.com',
    })

    await configurador.prepararDocumento()

    // --- El documento --------------------------------------------------------
    await expect(documento.titulo(DOCUMENTO.numero)).toBeVisible()
    await expect(documento.fechaEmision(DOCUMENTO.emision)).toBeVisible()
    await expect(
      documento.validez(DOCUMENTO.diasDeValidez, DOCUMENTO.validoHasta),
    ).toBeVisible()

    // El configurador ya no está en la página: el documento lo sustituye, no se
    // abre debajo. Es lo que garantiza que el catálogo no pueda salir impreso.
    await expect(configurador.titulo).toBeHidden()
    await expect(configurador.formulario).toBeHidden()

    // Los datos del cliente, impresos.
    await expect(page.getByText('Ana Pérez', { exact: true })).toBeVisible()
    await expect(
      page.getByText('Comercial del Norte', { exact: true }),
    ).toBeVisible()
    await expect(
      page.getByText('ana@example.com', { exact: true }),
    ).toBeVisible()

    // Los tres servicios, con su cantidad y sus meses.
    await expect(documento.lineaServicio(SERVICIOS.tienda)).toContainText(
      '1 unidad × 2.500,00 €',
    )
    await expect(documento.lineaServicio(SERVICIOS.seo)).toContainText(
      '1 unidad × 450,00 €/mes · 12 meses',
    )
    await expect(documento.lineaServicio(SERVICIOS.hosting)).toContainText(
      '1 unidad × 120,00 €/año',
    )

    // --- Las mismas cifras que en la pantalla -------------------------------
    //
    // Esta es la comprobación que da sentido al recorrido: el documento usa el
    // mismo componente de resumen con el mismo presupuesto, así que lo impreso
    // no puede discrepar de lo que se vio. Aquí se verifica de verdad.
    for (const [bloque, cifras] of esperado) {
      await expect(documento.fila(bloque, 'Total')).toHaveText(cifras.total)
    }

    await expect(documento.importePrimerPago).toHaveText(CIFRAS.primerDia)

    // --- Y lo que el documento NO lleva -------------------------------------
    //
    // Dos decisiones con su ADR, vigiladas aquí igual que en los tests de
    // Vitest: ni un total general (ADR 0007) ni el compromiso total de los
    // meses (ADR 0011). La hoja con huecos invita a rellenarlos, y estas dos
    // líneas son las que avisarían.
    await expect(page.getByText('5.400,00 €')).toHaveCount(0)
    await expect(page.getByText('4.911,36 €')).toHaveCount(0)

    // --- Volver no pierde nada -----------------------------------------------
    await documento.volver()

    await expect(configurador.titulo).toBeVisible()
    await expect(configurador.fila(BLOQUES.cuotaMensual, 'Total')).toHaveText(
      CIFRAS.cuotaMensual.total,
    )

    // El formulario reaparece con lo que se escribió, en lugar de obligar a
    // escribirlo otra vez.
    await expect(configurador.campoCliente('Nombre')).toHaveValue('Ana Pérez')
  })
})
