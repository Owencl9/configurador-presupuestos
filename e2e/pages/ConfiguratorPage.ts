import { expect, type Locator, type Page } from '@playwright/test'

/* =============================================================================
 * LAS CLAVES DE `localStorage`, ESCRITAS A MANO Y NO IMPORTADAS
 * =============================================================================
 *
 * `src/features/budget/draftFormat.ts` exporta esta misma cadena, y aquí está
 * copiada **a propósito**.
 *
 * Importarla haría que el test siguiera automáticamente cualquier cambio de la
 * clave, y entonces dejaría de comprobar lo único que importa de una clave de
 * almacenamiento: que es **la misma de ayer**. Si alguien la cambia, todos los
 * borradores guardados en los navegadores de quienes usan la aplicación quedan
 * huérfanos, y eso es un cambio de comportamiento que un test tiene que
 * detectar, no acompañar.
 *
 * Es el mismo criterio que el de los nombres accesibles: el test mira la
 * aplicación desde fuera, como el navegador, no desde dentro.
 * ========================================================================== */

/** Donde vive el borrador del presupuesto. */
export const CLAVE_BORRADOR = 'configurador-presupuestos:budget-draft:v1'

/** Donde vive el contador de números de presupuesto. */
export const CLAVE_CONTADOR = 'configurador-presupuestos:budget-counter:v1'

/**
 * Page Object del configurador: el catálogo, el presupuesto y el formulario.
 *
 * ## Por qué existe, más allá de que la especificación lo pida
 *
 * Hay dos motivos concretos en esta aplicación:
 *
 * 1. **Los nombres accesibles son largos y compartidos.** El botón de quitar un
 *    servicio se llama `Quitar Tienda online del presupuesto` **en dos sitios**
 *    de la pantalla: en la tarjeta del catálogo y en la línea del presupuesto.
 *    Es deliberado —es la misma acción vista desde dos sitios, decisión de la
 *    Fase 4—, y significa que un localizador global encontraría dos elementos y
 *    Playwright se negaría a actuar. Aquí cada método busca dentro de su región.
 * 2. **El desglose tiene trampa.** El concepto «Total» es una subcadena de
 *    «Subtotal», así que una búsqueda por texto parcial confunde las dos filas.
 *    El método `fila()` compara el texto completo.
 *
 * Todos los localizadores van **por rol y nombre accesible**, igual que los
 * tests de Vitest. Así un cambio de clases de Tailwind no rompe nada y, de paso,
 * cada test comprueba que el nombre accesible sigue existiendo.
 */
export class ConfiguratorPage {
  readonly page: Page

  /** El encabezado principal. Sirve para saber que estamos en el configurador. */
  readonly titulo: Locator

  /** La región del presupuesto, con sus líneas y su resumen. */
  readonly presupuesto: Locator

  /** El formulario de los datos del cliente. */
  readonly formulario: Locator

  /** El botón que lleva al documento. */
  readonly botonPrepararDocumento: Locator

  constructor(page: Page) {
    this.page = page

    this.titulo = page.getByRole('heading', {
      level: 1,
      name: 'Configurador de Presupuestos',
    })

    this.presupuesto = page.getByRole('region', { name: 'Tu presupuesto' })

    // El `<form>` lleva `aria-label="Datos del cliente"`, así que tiene rol de
    // formulario. La `<section>` que lo envuelve tiene el mismo nombre pero rol
    // de región: son dos elementos distintos y no se confunden.
    this.formulario = page.getByRole('form', { name: 'Datos del cliente' })

    this.botonPrepararDocumento = this.formulario.getByRole('button', {
      name: 'Preparar el documento',
    })
  }

  async goto(): Promise<void> {
    await this.page.goto('/')
    await expect(this.titulo).toBeVisible()
  }

  /**
   * La frase de estado del presupuesto.
   *
   * Se localiza por `aria-live`, que es un atributo de accesibilidad y no de
   * presentación: es *la* región activa de la pantalla, y si dejara de serlo
   * este localizador tendría que fallar.
   */
  get estado(): Locator {
    return this.presupuesto.locator('p[aria-live="polite"]')
  }

  /**
   * La tarjeta de un servicio **en el catálogo**.
   *
   * Se distingue de la línea del presupuesto por su encabezado: la tarjeta del
   * catálogo tiene un `h3` con el nombre del servicio y la línea del
   * presupuesto no tiene ningún encabezado.
   */
  tarjeta(servicio: string): Locator {
    return this.page.getByRole('article').filter({
      has: this.page.getByRole('heading', {
        level: 3,
        name: servicio,
        exact: true,
      }),
    })
  }

  /** La línea de un servicio **en el presupuesto**. */
  linea(servicio: string): Locator {
    return this.presupuesto.getByRole('listitem').filter({
      has: this.page.getByText(servicio, { exact: true }),
    })
  }

  /** Añade un servicio desde el catálogo. */
  async anadirServicio(servicio: string): Promise<void> {
    await this.tarjeta(servicio)
      .getByRole('button', { name: `Añadir ${servicio} al presupuesto` })
      .click()

    await expect(this.linea(servicio)).toBeVisible()
  }

  /** El botón de la tarjeta del catálogo, para comprobar su `aria-pressed`. */
  botonTarjeta(servicio: string): Locator {
    return this.tarjeta(servicio).getByRole('button')
  }

  /** El campo de los meses de un servicio mensual. */
  campoMeses(servicio: string): Locator {
    return this.page.getByRole('spinbutton', { name: `Meses de ${servicio}` })
  }

  /** El campo de la cantidad de un servicio. */
  campoCantidad(servicio: string): Locator {
    return this.page.getByRole('spinbutton', {
      name: `Cantidad de ${servicio}`,
    })
  }

  /**
   * Cambia los meses de un servicio mensual.
   *
   * Escribe el valor y **pulsa Enter**, que es una de las dos formas en que el
   * selector confirma lo escrito (la otra es salir del campo). Nunca se corrige
   * al teclear, por la decisión de la Fase 4: con el mínimo en 6, escribir «12»
   * pasa por un «1» que está por debajo del mínimo.
   */
  async cambiarMeses(servicio: string, meses: number): Promise<void> {
    const campo = this.campoMeses(servicio)

    await campo.fill(String(meses))
    await campo.press('Enter')

    await expect(campo).toHaveValue(String(meses))
  }

  /**
   * Un bloque de pago del resumen: «Pago inicial», «Cuota mensual» o
   * «Pago anual».
   *
   * Se busca dentro de la región del presupuesto para no confundirlo con el
   * mismo bloque dibujado en el documento, que usa el mismo componente.
   */
  bloque(titulo: string): Locator {
    return this.presupuesto
      .getByRole('heading', { level: 4, name: titulo, exact: true })
      .locator('..')
  }

  /**
   * El importe de una fila del desglose de un bloque.
   *
   * El término se compara **por texto completo**: «Total» es una subcadena de
   * «Subtotal», y una comparación parcial devolvería las dos filas.
   */
  fila(bloque: string, termino: string): Locator {
    return this.bloque(bloque)
      .locator('dl > div')
      .filter({ has: this.page.getByText(termino, { exact: true }) })
      .locator('dd')
  }

  /** Rellena el formulario del cliente. Los campos opcionales se pueden omitir. */
  async rellenarCliente(datos: {
    nombre?: string
    empresa?: string
    correo?: string
  }): Promise<void> {
    if (datos.nombre !== undefined) {
      await this.campoCliente('Nombre').fill(datos.nombre)
    }

    if (datos.empresa !== undefined) {
      await this.campoCliente('Empresa (opcional)').fill(datos.empresa)
    }

    if (datos.correo !== undefined) {
      await this.campoCliente('Correo electrónico (opcional)').fill(
        datos.correo,
      )
    }
  }

  /** Un campo del formulario del cliente, por su etiqueta. */
  campoCliente(etiqueta: string): Locator {
    return this.formulario.getByRole('textbox', { name: etiqueta, exact: true })
  }

  /** Pulsa «Preparar el documento». */
  async prepararDocumento(): Promise<void> {
    await this.botonPrepararDocumento.click()
  }

  /** El contenido **en bruto** del borrador guardado, o `null` si no hay. */
  async borradorEnBruto(): Promise<string | null> {
    return this.page.evaluate(
      (clave) => window.localStorage.getItem(clave),
      CLAVE_BORRADOR,
    )
  }

  /**
   * Todo lo que hay en `localStorage`, serializado.
   *
   * Es el volcado completo y no una clave concreta, y la diferencia importa:
   * comprobar que el borrador no tiene datos personales no demuestra nada si
   * otra clave sí los tiene. Lo que esto permite afirmar es que **en todo el
   * almacenamiento del navegador** no hay ni una dirección de correo
   * (ADR 0013).
   */
  async volcadoDeAlmacenamiento(): Promise<string> {
    return this.page.evaluate(() => JSON.stringify(window.localStorage))
  }

  /**
   * Pulsa el tabulador hasta que el foco llegue al elemento indicado.
   *
   * ## Por qué un bucle y no un número fijo de tabulaciones
   *
   * Porque el número real no es estable, y no por un descuido: **los botones
   * desactivados no reciben el foco**, y los de «−» de los selectores están
   * desactivados cuando el valor está en su mínimo. Así que la cuenta de
   * tabulaciones hasta el formulario depende de los valores que tenga el
   * presupuesto en ese momento. Un número fijo convertiría este test en una
   * trampa que se rompe al cambiar una cantidad.
   *
   * Lo que se comprueba con esto es lo que exige el apartado 3 de `CLAUDE.md`:
   * que **todo es alcanzable con el teclado**. Si un control deja de serlo, el
   * bucle se agota y el test falla nombrándolo.
   */
  async tabularHasta(destino: Locator, maximo = 60): Promise<void> {
    for (let intento = 0; intento < maximo; intento += 1) {
      await this.page.keyboard.press('Tab')

      if (await destino.evaluate((el) => el === document.activeElement)) {
        return
      }
    }

    throw new Error(
      `El foco no ha llegado al elemento esperado en ${String(maximo)} tabulaciones. ` +
        'O no es alcanzable con el teclado, o el orden de tabulación ha cambiado.',
    )
  }
}
