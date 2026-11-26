import { type Locator, type Page } from '@playwright/test'

/**
 * Page Object del documento del presupuesto.
 *
 * El documento **sustituye** al configurador en la pantalla, no se abre debajo
 * (decisión de la Fase 7: lo que no existe no se puede imprimir). Así que si
 * este Page Object encuentra sus elementos, el configurador ya no está.
 *
 * El desglose de importes lo dibuja el mismo componente que la pantalla, con el
 * mismo presupuesto, así que `bloque()` y `fila()` se parecen a los del
 * configurador. Están repetidos y no heredados a propósito: son dos pantallas
 * distintas y mañana una puede cambiar sin la otra.
 */
export class DocumentPage {
  readonly page: Page

  /** El botón de imprimir. No tiene que salir impreso. */
  readonly botonImprimir: Locator

  /** El botón de volver. Tampoco tiene que salir impreso. */
  readonly botonVolver: Locator

  /** La nota de que la numeración es de este navegador. Tampoco se imprime. */
  readonly notaNumeracion: Locator

  /** El pie del documento, que sí se imprime. */
  readonly pie: Locator

  constructor(page: Page) {
    this.page = page

    this.botonImprimir = page.getByRole('button', {
      name: 'Imprimir o guardar en PDF',
    })

    this.botonVolver = page.getByRole('button', {
      name: 'Volver al configurador',
    })

    this.notaNumeracion = page.getByText(
      'La numeración se lleva en este navegador',
    )

    this.pie = page.getByText('Documento de ejemplo.')
  }

  /**
   * El encabezado del documento, que incluye el número.
   *
   * Es un `h1`: el documento es una pantalla completa, no una sección del
   * configurador.
   */
  titulo(numero: string): Locator {
    return this.page.getByRole('heading', {
      level: 1,
      name: `Presupuesto ${numero}`,
    })
  }

  /** La fecha de emisión impresa. */
  fechaEmision(fecha: string): Locator {
    return this.page.getByText(`Fecha de emisión: ${fecha}`)
  }

  /** La validez impresa, con su fecha límite. */
  validez(dias: number, fecha: string): Locator {
    return this.page.getByText(`Válido ${String(dias)} días, hasta el ${fecha}`)
  }

  /**
   * La línea «A pagar el primer día (orientativo)», que **sí** se imprime
   * (ADR 0008).
   *
   * Se localiza el párrafo entero y no solo el texto porque la etiqueta y su
   * importe son dos `<span>` hermanos: para leer el importe hace falta el padre.
   */
  get lineaPrimerPago(): Locator {
    return this.page
      .locator('p')
      .filter({ hasText: 'A pagar el primer día (orientativo)' })
  }

  /** El importe de la línea del primer día. */
  get importePrimerPago(): Locator {
    return this.lineaPrimerPago.locator('span').last()
  }

  /** La línea de un servicio en la lista del documento. */
  lineaServicio(nombre: string): Locator {
    return this.page.getByRole('listitem').filter({
      has: this.page.getByText(nombre, { exact: true }),
    })
  }

  /**
   * Un bloque de pago del documento.
   *
   * Se busca el encabezado del bloque y se sube a **su sección padre** (`'..'`
   * es una ruta XPath). No se busca la sección y se filtra por su encabezado,
   * que fue el primer intento y estaba mal: en el documento las secciones están
   * **anidadas** —la de «Importes» contiene las tres de los bloques—, así que
   * ese filtro casaba con las dos, y dentro de la de fuera hay tres filas
   * «Total». El encabezado, en cambio, es hijo directo de su bloque y solo de
   * uno.
   */
  bloque(titulo: string): Locator {
    return this.page
      .getByRole('heading', { level: 4, name: titulo, exact: true })
      .locator('..')
  }

  /**
   * El importe de una fila del desglose.
   *
   * Compara el término por texto completo, por lo mismo que en el configurador:
   * «Total» es una subcadena de «Subtotal».
   */
  fila(bloque: string, termino: string): Locator {
    return this.bloque(bloque)
      .locator('dl > div')
      .filter({ has: this.page.getByText(termino, { exact: true }) })
      .locator('dd')
  }

  /** Vuelve al configurador. */
  async volver(): Promise<void> {
    await this.botonVolver.click()
  }
}
