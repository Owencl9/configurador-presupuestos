import { expect, test } from './cspGuard'

import {
  BLOQUES,
  CIFRAS,
  DOCUMENTO,
  FECHA_FIJA,
  MESES,
  montarEjemplo,
  SERVICIOS,
} from './exampleBudget'
import { ConfiguratorPage } from './pages/ConfiguratorPage'
import { DocumentPage } from './pages/DocumentPage'

/**
 * Recorrido 2 — Lo que sobrevive a una recarga y lo que no.
 *
 * Son las dos mitades de la misma decisión, y por eso van en el mismo test: el
 * presupuesto se guarda en el navegador (ADR 0009) y **los datos del cliente
 * no se guardan en ninguna parte** (ADR 0013). Comprobar solo una de las dos no
 * demuestra la decisión, porque una aplicación que no guarda nada pasaría la
 * segunda mitad y fallaría la primera.
 *
 * Esto es lo que jsdom no puede hacer: un `localStorage` de verdad y una
 * recarga de verdad, con el paquete compilado.
 */
test.describe('El borrador en el navegador', () => {
  test('el presupuesto sobrevive a la recarga y los datos del cliente desaparecen', async ({
    page,
  }) => {
    await page.clock.setFixedTime(FECHA_FIJA)

    const configurador = new ConfiguratorPage(page)
    const documento = new DocumentPage(page)

    await configurador.goto()
    await montarEjemplo(configurador)

    // --- Qué se ha guardado, exactamente ------------------------------------
    const borrador = await configurador.borradorEnBruto()

    expect(borrador).not.toBeNull()

    const guardado: unknown = JSON.parse(borrador ?? '')

    // Tres campos y ninguno más: identificador, cantidad y meses.
    expect(guardado).toEqual({
      lines: [
        { serviceId: 'online-store', quantity: 1 },
        { serviceId: 'seo-professional', quantity: 1, months: MESES },
        { serviceId: 'hosting-domain', quantity: 1 },
      ],
    })

    /*
     * Y lo que **no** se ha guardado, sobre la cadena en bruto: ni precios, ni
     * nombres, ni importes. Al recuperar el borrador, todo eso se vuelve a
     * sacar del catálogo, así que editar el almacenamiento del navegador no
     * puede cambiar un precio.
     *
     * El control positivo es la primera línea: la misma búsqueda, sobre la
     * misma cadena, encuentra el identificador que sí tiene que estar. Sin esa
     * pareja, los cuatro «no contiene» pasarían igual con una cadena vacía.
     */
    expect(borrador).toContain('online-store')
    expect(borrador).not.toContain('Tienda online')
    expect(borrador).not.toContain('250000')
    expect(borrador).not.toContain('2.500,00')
    expect(borrador).not.toContain('priceCents')

    // --- Con los datos del cliente ya escritos e impresos -------------------
    await configurador.rellenarCliente({
      nombre: 'Ana Pérez',
      empresa: 'Comercial del Norte',
      correo: 'ana@example.com',
    })

    await configurador.prepararDocumento()
    await expect(documento.titulo(DOCUMENTO.numero)).toBeVisible()
    await documento.volver()

    /*
     * El volcado **completo** de `localStorage`, no solo la clave del borrador:
     * que el borrador esté limpio no demuestra nada si el contador de números
     * guardara el correo. Aquí ya se ha escrito una dirección en el formulario
     * y se ha emitido el documento, que es el momento de máximo riesgo.
     *
     * Control positivo otra vez: el mismo volcado sí contiene el identificador
     * del servicio y la clave del contador.
     */
    const volcado = await configurador.volcadoDeAlmacenamiento()

    expect(volcado).toContain('online-store')
    expect(volcado).toContain('lastNumber')
    expect(volcado).not.toContain('@')
    expect(volcado).not.toContain('Ana')
    expect(volcado).not.toContain('Comercial del Norte')

    // --- La recarga ----------------------------------------------------------
    await page.reload()
    await expect(configurador.titulo).toBeVisible()

    // El presupuesto sigue entero, con sus tres líneas, sus doce meses y sus
    // importes. No es que se vea algo parecido: son las mismas cifras.
    await expect(configurador.linea(SERVICIOS.tienda)).toBeVisible()
    await expect(configurador.linea(SERVICIOS.seo)).toBeVisible()
    await expect(configurador.linea(SERVICIOS.hosting)).toBeVisible()

    await expect(configurador.campoMeses(SERVICIOS.seo)).toHaveValue(
      String(MESES),
    )

    await expect(configurador.fila(BLOQUES.pagoInicial, 'Total')).toHaveText(
      CIFRAS.pagoInicial.total,
    )
    await expect(configurador.fila(BLOQUES.cuotaMensual, 'Total')).toHaveText(
      CIFRAS.cuotaMensual.total,
    )
    await expect(configurador.fila(BLOQUES.pagoAnual, 'Total')).toHaveText(
      CIFRAS.pagoAnual.total,
    )

    await expect(configurador.estado).toHaveText(
      `3 servicios en el presupuesto. A pagar el primer día (orientativo): ${CIFRAS.primerDia}`,
    )

    // Y los datos del cliente se han ido, los tres campos. La pantalla lo
    // avisa, porque si no, un formulario vacío tras recargar parecería un fallo.
    await expect(configurador.campoCliente('Nombre')).toHaveValue('')
    await expect(configurador.campoCliente('Empresa (opcional)')).toHaveValue(
      '',
    )
    await expect(
      configurador.campoCliente('Correo electrónico (opcional)'),
    ).toHaveValue('')

    await expect(
      page.getByText('no se guardan', { exact: false }),
    ).toBeVisible()
  })
})
