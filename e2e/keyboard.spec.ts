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
 * Recorrido 4 — Del catálogo al documento sin tocar el ratón.
 *
 * El apartado 3 de `CLAUDE.md` exige que todo sea operable con el teclado, y
 * hasta ahora eso se apoyaba en dos cosas: los tests de foco de Vitest, que
 * comprueban elementos sueltos, y la revisión manual. Lo que falta es la
 * pregunta completa: **¿se puede usar la aplicación de principio a fin con el
 * tabulador?**
 *
 * Un navegador real es el único sitio donde se puede responder, porque el orden
 * de tabulación lo decide el motor del navegador a partir del orden del
 * documento, de los `tabindex` y de qué elementos están desactivados.
 *
 * ## Dos formas de comprobar, y por qué son dos
 *
 * - **Orden estricto** en los sitios donde el orden es predecible y significa
 *   algo: las tres primeras tarjetas del catálogo y los tres campos del
 *   formulario con su botón. Aquí el test afirma exactamente dónde cae el foco
 *   en cada pulsación.
 * - **Alcanzabilidad** en el resto, con `tabularHasta`. El número de
 *   tabulaciones hasta el panel del presupuesto no es estable, y no por un
 *   descuido: los botones «−» de los selectores están desactivados cuando el
 *   valor está en su mínimo, y un botón desactivado no recibe el foco. Un
 *   número fijo sería una trampa que se rompe al cambiar una cantidad.
 */
test.describe('Recorrido con el teclado', () => {
  test('se puede llegar al documento usando solo el tabulador y Enter', async ({
    page,
  }) => {
    await page.clock.setFixedTime(FECHA_FIJA)

    const configurador = new ConfiguratorPage(page)
    const documento = new DocumentPage(page)

    await configurador.goto()

    /* ------------------------------------------------------------------------
     * El catálogo, con el orden exacto.
     *
     * Las tres primeras tarjetas de «Diseño web» están en el orden declarado en
     * el archivo de datos, y sus botones son lo primero que se puede enfocar de
     * la página: antes solo hay un encabezado y un párrafo.
     * --------------------------------------------------------------------- */
    await page.keyboard.press('Tab')
    await expect(
      configurador.botonTarjeta('Landing page de campaña'),
    ).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(configurador.botonTarjeta('Web corporativa')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(configurador.botonTarjeta(SERVICIOS.tienda)).toBeFocused()

    // Enter sobre el botón enfocado: el servicio entra en el presupuesto.
    await page.keyboard.press('Enter')
    await expect(configurador.linea(SERVICIOS.tienda)).toBeVisible()

    // El foco no se ha movido, y es importante: el botón ha cambiado de
    // «Añadir» a «Quitar» sin perder el foco, así que se puede deshacer al
    // instante con otro Enter.
    await expect(configurador.botonTarjeta(SERVICIOS.tienda)).toBeFocused()
    await expect(configurador.botonTarjeta(SERVICIOS.tienda)).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    /* ------------------------------------------------------------------------
     * Los otros dos servicios, por alcanzabilidad.
     * --------------------------------------------------------------------- */
    await configurador.tabularHasta(configurador.botonTarjeta(SERVICIOS.seo))
    await page.keyboard.press('Enter')
    await expect(configurador.linea(SERVICIOS.seo)).toBeVisible()

    await configurador.tabularHasta(
      configurador.botonTarjeta(SERVICIOS.hosting),
    )
    await page.keyboard.press('Enter')
    await expect(configurador.linea(SERVICIOS.hosting)).toBeVisible()

    /* ------------------------------------------------------------------------
     * Los meses, escribiéndolos.
     *
     * Se escribe el valor y se confirma con Enter, que es una de las dos formas
     * en que el selector acepta lo escrito. La otra es salir del campo. Nunca
     * se corrige al teclear: con el mínimo en 6, escribir «12» pasa por un «1».
     * --------------------------------------------------------------------- */
    const campoMeses = configurador.campoMeses(SERVICIOS.seo)

    await configurador.tabularHasta(campoMeses)
    await expect(campoMeses).toHaveValue('6')

    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type(String(MESES))
    await page.keyboard.press('Enter')

    await expect(campoMeses).toHaveValue(String(MESES))

    // El descuento por permanencia se ha aplicado, y el campo lo anuncia.
    await expect(campoMeses).toHaveAccessibleDescription(
      /Descuento por permanencia aplicado/,
    )
    await expect(configurador.fila(BLOQUES.cuotaMensual, 'Total')).toHaveText(
      CIFRAS.cuotaMensual.total,
    )

    /* ------------------------------------------------------------------------
     * El formulario, con el orden exacto.
     *
     * Aquí el orden sí importa y sí es predecible: nombre, empresa, correo y
     * botón. Es el orden en que se leen las etiquetas, y si alguna vez un campo
     * se colara en medio, este bloque lo diría.
     * --------------------------------------------------------------------- */
    const campoNombre = configurador.campoCliente('Nombre')

    await configurador.tabularHasta(campoNombre)
    await page.keyboard.type('Ana Pérez')

    await page.keyboard.press('Tab')
    await expect(configurador.campoCliente('Empresa (opcional)')).toBeFocused()
    await page.keyboard.type('Comercial del Norte')

    await page.keyboard.press('Tab')
    await expect(
      configurador.campoCliente('Correo electrónico (opcional)'),
    ).toBeFocused()
    await page.keyboard.type('ana@example.com')

    await page.keyboard.press('Tab')
    await expect(configurador.botonPrepararDocumento).toBeFocused()

    /* ------------------------------------------------------------------------
     * Y el documento, con Enter.
     * --------------------------------------------------------------------- */
    await page.keyboard.press('Enter')

    await expect(documento.titulo(DOCUMENTO.numero)).toBeVisible()
    await expect(documento.importePrimerPago).toHaveText(CIFRAS.primerDia)

    // Los dos botones del documento también son alcanzables con el teclado:
    // sin eso, quien no usa ratón llegaría al documento y no podría imprimirlo
    // ni volver atrás.
    await configurador.tabularHasta(documento.botonImprimir)
    await page.keyboard.press('Tab')
    await expect(documento.botonVolver).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(configurador.titulo).toBeVisible()
  })
})
