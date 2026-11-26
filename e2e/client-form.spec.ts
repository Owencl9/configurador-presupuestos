import { expect, test } from '@playwright/test'

import { DOCUMENTO, FECHA_FIJA, SERVICIOS } from './exampleBudget'
import { ConfiguratorPage } from './pages/ConfiguratorPage'
import { DocumentPage } from './pages/DocumentPage'

/**
 * Recorrido 5 — El formulario protege lo que promete.
 *
 * ## La comprobación que solo existe aquí
 *
 * El `<form>` del cliente **no tiene `action`** y su envío está interceptado con
 * `preventDefault()`. Esa línea es la que sostiene la promesa del ADR 0013: si
 * faltara, el navegador enviaría el formulario a la propia página, **recargaría
 * y pondría el nombre, la empresa y el correo del cliente en la URL**, donde
 * quedan en el historial del navegador.
 *
 * Ese fallo es **invisible para Vitest**, y no por un descuido: jsdom no navega
 * nunca. Sin `preventDefault`, los 560 tests seguirían en verde y los datos del
 * cliente acabarían en la barra de direcciones. Aquí se comprueba de dos
 * formas: contando las navegaciones del navegador y mirando la URL.
 *
 * Y la validación se comprueba de paso, porque el envío con errores es
 * precisamente el momento en que un formulario mal interceptado navegaría.
 */
test.describe('El formulario del cliente', () => {
  test('valida, lleva el foco al error y no navega ni pone los datos en la URL', async ({
    page,
  }) => {
    await page.clock.setFixedTime(FECHA_FIJA)

    const configurador = new ConfiguratorPage(page)
    const documento = new DocumentPage(page)

    await configurador.goto()
    await configurador.anadirServicio(SERVICIOS.tienda)

    const urlInicial = page.url()

    /*
     * El contador de navegaciones se engancha **después** de cargar la página,
     * así que la carga inicial no cuenta. A partir de aquí, cualquier recarga o
     * cambio de URL incrementa este número.
     */
    let navegaciones = 0
    page.on('framenavigated', () => {
      navegaciones += 1
    })

    /* ------------------------------------------------------------------------
     * Envío con el nombre vacío.
     * --------------------------------------------------------------------- */
    await configurador.prepararDocumento()

    const campoNombre = configurador.campoCliente('Nombre')

    // El mensaje llega al campo, que es lo que se le anuncia a quien entra en
    // él. Se comprueba el resultado y no la técnica: no importa si el error se
    // asocia con `aria-describedby` o de otra forma, importa que se lea.
    await expect(campoNombre).toHaveAccessibleDescription(
      'Escribe el nombre del cliente.',
    )
    await expect(campoNombre).toHaveAttribute('aria-invalid', 'true')

    // El foco salta al primer campo con error. Sin esto, quien usa el teclado
    // se queda en el botón y tiene que recorrer la pantalla hacia atrás
    // buscando qué ha fallado.
    await expect(campoNombre).toBeFocused()

    // El error lleva un símbolo además del color: la información no se
    // transmite solo con el color (apartado 3 de CLAUDE.md).
    await expect(
      page.getByText('⚠ Escribe el nombre del cliente.'),
    ).toBeVisible()

    // No se ha llegado al documento.
    await expect(documento.titulo(DOCUMENTO.numero)).toHaveCount(0)
    await expect(configurador.titulo).toBeVisible()

    /* ------------------------------------------------------------------------
     * Y lo importante: el navegador no se ha movido.
     * --------------------------------------------------------------------- */
    expect(navegaciones).toBe(0)
    expect(page.url()).toBe(urlInicial)

    /* ------------------------------------------------------------------------
     * Un correo con mala pinta: el segundo error, con el nombre ya correcto.
     * --------------------------------------------------------------------- */
    await configurador.rellenarCliente({
      nombre: 'Ana Pérez',
      correo: 'ana-sin-arroba',
    })

    await configurador.prepararDocumento()

    const campoCorreo = configurador.campoCliente(
      'Correo electrónico (opcional)',
    )

    await expect(campoCorreo).toHaveAccessibleDescription(
      'Escribe un correo con el formato nombre@example.com, o déjalo vacío.',
    )
    await expect(campoCorreo).toBeFocused()

    // El nombre ya no protesta: los errores salen todos a la vez y se van en
    // cuanto el campo es correcto.
    await expect(campoNombre).not.toHaveAttribute('aria-invalid', 'true')

    await expect(documento.titulo(DOCUMENTO.numero)).toHaveCount(0)
    expect(navegaciones).toBe(0)
    expect(page.url()).toBe(urlInicial)

    /* ------------------------------------------------------------------------
     * Corregido, se llega al documento.
     *
     * Es el control positivo de todo el test: sin esta parte, lo anterior
     * pasaría igual si el botón no hiciera nada en absoluto.
     * --------------------------------------------------------------------- */
    await configurador.rellenarCliente({ correo: 'ana@example.com' })
    await configurador.prepararDocumento()

    await expect(documento.titulo(DOCUMENTO.numero)).toBeVisible()

    // Ni siquiera el envío correcto navega: el documento es un cambio de estado
    // de React, no una página nueva. Así que no hay URL que compartir, y por
    // eso el proyecto no tiene enrutador.
    expect(navegaciones).toBe(0)
    expect(page.url()).toBe(urlInicial)
  })
})
