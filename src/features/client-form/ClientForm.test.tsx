import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CLIENT_TEXT_MAX_LENGTH } from '../../shared/constants/business-rules'

import { ClientForm } from './ClientForm'

/*
 * Los tests consultan por **rol y por nombre accesible**, no por clases de CSS
 * ni por estructura de etiquetas. Es la norma del proyecto desde la Fase 1: así
 * prueban lo que una persona —o un lector de pantalla— encuentra en la
 * pantalla, y no cómo está escrito el HTML por dentro.
 */
describe('ClientForm', () => {
  /*
   * **Quién decide si este formulario se ve no es este componente**, así que no
   * hay aquí ningún test de «no se muestra con el presupuesto vacío». Lo decide
   * `Configurator`, que lo renderiza solo cuando hay líneas, y lo comprueba el
   * test de integración «no ofrece el formulario del cliente con el presupuesto
   * vacío» de `App.test.tsx`.
   *
   * La primera versión sí lo resolvía aquí, con una prop `hasLines` y un
   * `return null`. Estaba mal: devolver `null` no desmonta el componente, así
   * que sus `useState` sobrevivían y el presupuesto siguiente heredaba los
   * datos del cliente anterior. El test de integración de «Empezar de nuevo»
   * fue el que lo destapó.
   */
  it('es una región con nombre accesible y un encabezado de nivel 2', () => {
    // La jerarquía del configurador es h1 (título) → h2 (categorías, «Tu
    // presupuesto» y esta sección) → h3 → h4, sin saltos.
    render(<ClientForm onSubmit={vi.fn()} />)

    expect(
      screen.getByRole('heading', { level: 2, name: /datos del cliente/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: /datos del cliente/i }),
    ).toBeInTheDocument()
  })

  it('muestra los tres campos', () => {
    render(<ClientForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/^nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^empresa/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^correo/i)).toBeInTheDocument()
  })

  it('anuncia en la etiqueta qué campos son opcionales', () => {
    /*
     * «Opcional» va **en la etiqueta**, no en un asterisco con una leyenda
     * aparte. Un asterisco obliga a buscar qué significa, y un lector de
     * pantalla lo lee como «asterisco». La palabra entera viaja con el campo.
     */
    render(<ClientForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/^empresa \(opcional\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^correo.*\(opcional\)/i)).toBeInTheDocument()
    // El nombre es el único obligatorio, así que no lleva esa palabra.
    expect(screen.getByLabelText(/^nombre/i)).toHaveAttribute('required')
  })

  it('avisa de que los datos del cliente no se guardan', () => {
    /*
     * Es la parte visible de la decisión nº 16: los datos del cliente no van a
     * `localStorage`, así que al recargar la página el formulario aparece
     * vacío. Si la pantalla no lo dijera, eso parecería un fallo. Decisión del
     * usuario al autorizar la fase (ADR 0013).
     */
    render(<ClientForm onSubmit={vi.fn()} />)

    expect(screen.getByText(/no se guardan/i)).toBeInTheDocument()
  })

  describe('al enviar con errores', () => {
    it('no llama a onSubmit', async () => {
      const onSubmit = vi.fn()
      render(<ClientForm onSubmit={onSubmit} />)

      await userEvent.click(
        screen.getByRole('button', { name: /preparar el documento/i }),
      )

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('asocia el mensaje de error a su campo', async () => {
      /*
       * **El test de accesibilidad importante de este componente.** No basta con
       * que el mensaje esté en la pantalla: tiene que estar asociado al campo,
       * porque si no, quien usa un lector de pantalla oye «error» en algún sitio
       * y no sabe de qué campo es.
       *
       * `toHaveAccessibleDescription` comprueba justo eso: que el texto del
       * mensaje forma parte de la descripción del campo, que es lo que se lee al
       * entrar en él. Comprobarlo así, y no leyendo el atributo
       * `aria-describedby` a mano, prueba el resultado y no la técnica.
       */
      render(<ClientForm onSubmit={vi.fn()} />)

      await userEvent.click(
        screen.getByRole('button', { name: /preparar el documento/i }),
      )

      const nombre = screen.getByLabelText(/^nombre/i)

      expect(nombre).toHaveAccessibleDescription(/escribe el nombre/i)
      expect(nombre).toHaveAttribute('aria-invalid', 'true')
    })

    it('lleva el foco al primer campo con error', async () => {
      /*
       * Sin mover el foco, quien envía el formulario con el teclado se queda en
       * el botón y tiene que recorrer la pantalla hacia atrás buscando qué ha
       * fallado. Con el foco en el campo, el lector de pantalla anuncia la
       * etiqueta y el mensaje de golpe.
       */
      render(<ClientForm onSubmit={vi.fn()} />)

      await userEvent.click(
        screen.getByRole('button', { name: /preparar el documento/i }),
      )

      expect(screen.getByLabelText(/^nombre/i)).toHaveFocus()
    })

    it('muestra los errores de varios campos a la vez', async () => {
      // Enseñar un error, y al corregirlo descubrir que había otro, es la forma
      // más rápida de que alguien abandone un formulario.
      render(<ClientForm onSubmit={vi.fn()} />)

      await userEvent.type(
        screen.getByLabelText(/^empresa/i),
        'a'.repeat(CLIENT_TEXT_MAX_LENGTH + 1),
      )
      await userEvent.type(screen.getByLabelText(/^correo/i), 'no-es-un-correo')
      await userEvent.click(
        screen.getByRole('button', { name: /preparar el documento/i }),
      )

      expect(screen.getByLabelText(/^nombre/i)).toHaveAccessibleDescription(
        /escribe el nombre/i,
      )
      expect(screen.getByLabelText(/^empresa/i)).toHaveAccessibleDescription(
        /no puede pasar/i,
      )
      expect(screen.getByLabelText(/^correo/i)).toHaveAccessibleDescription(
        /formato nombre@example/i,
      )
    })
  })

  describe('al corregir un campo que ya tiene error', () => {
    it('quita el mensaje en cuanto el valor es válido', async () => {
      render(<ClientForm onSubmit={vi.fn()} />)

      await userEvent.click(
        screen.getByRole('button', { name: /preparar el documento/i }),
      )
      await userEvent.type(screen.getByLabelText(/^nombre/i), 'Ana Pérez')

      const nombre = screen.getByLabelText(/^nombre/i)

      expect(nombre).not.toHaveAttribute('aria-invalid', 'true')
      expect(screen.queryByText(/escribe el nombre/i)).not.toBeInTheDocument()
    })

    it('cambia el mensaje si el valor sigue sin ser válido', async () => {
      /*
       * Con una sola letra el nombre todavía no vale, y el mensaje tiene que
       * decir **lo que falta ahora**, no seguir diciendo «escribe el nombre»
       * cuando ya hay algo escrito.
       */
      render(<ClientForm onSubmit={vi.fn()} />)

      await userEvent.click(
        screen.getByRole('button', { name: /preparar el documento/i }),
      )
      await userEvent.type(screen.getByLabelText(/^nombre/i), 'A')

      expect(screen.getByLabelText(/^nombre/i)).toHaveAccessibleDescription(
        /al menos/i,
      )
    })

    it('no estrena errores mientras se escribe en un campo que no los tenía', async () => {
      /*
       * Decisión de comportamiento: solo se revalida en caliente el campo que
       * **ya** está mostrando un error. Escribir un correo letra a letra pasa
       * por «a», «an», «ana»… que no son correos válidos, y un formulario que
       * protesta en cada pulsación mientras se teclea es insoportable.
       *
       * Validar al enviar y corregir en caliente lo ya señalado es el mismo
       * criterio que el selector de cantidad de la Fase 4, que corrige al salir
       * del campo y no al teclear.
       */
      render(<ClientForm onSubmit={vi.fn()} />)

      const correo = () => screen.getByLabelText(/^correo/i)
      /*
       * El localizador compara contra el **principio** del mensaje, que no
       * contiene ningún dominio. Así un cambio en el ejemplo del texto —como el
       * de la corrección C7-4— no desata el test de lo que comprueba.
       */
      const mensajeDelCorreo = () =>
        screen.queryByText(/escribe un correo con el formato/i)

      await userEvent.type(correo(), 'ana@')

      expect(correo()).not.toHaveAttribute('aria-invalid', 'true')
      expect(mensajeDelCorreo()).not.toBeInTheDocument()

      /*
       * CONTROL POSITIVO DE LA ASERCIÓN ANTERIOR (Fase 9).
       *
       * Las dos líneas de arriba son **negativas**: afirman que algo no está. Y
       * una aserción negativa sobre un texto pasa igual si ese texto ya no
       * existe en ninguna parte, así que por sí sola no distingue «el formulario
       * se comporta como debe» de «ese mensaje ha desaparecido de la
       * aplicación». Medido: con el mensaje del correo borrado de
       * `validateClientData`, este test seguía en verde.
       *
       * Estas dos líneas cierran el hueco. Al enviar, el correo sí es inválido
       * y el mensaje tiene que aparecer, buscado **con el mismo localizador**.
       * Si el mensaje se borrara del formulario, la primera mitad seguiría
       * pasando y esta segunda se pondría en rojo, que es lo que convierte el
       * conjunto en una comprobación.
       *
       * Es la norma del apartado 5 de `CLAUDE.md` aplicada a un test en lugar
       * de a una búsqueda: un «no está» solo vale si la misma búsqueda encuentra
       * el dato cuando sí está.
       */
      await userEvent.click(
        screen.getByRole('button', { name: /preparar el documento/i }),
      )

      expect(correo()).toHaveAttribute('aria-invalid', 'true')
      expect(mensajeDelCorreo()).toBeInTheDocument()
    })
  })

  describe('al enviar datos válidos', () => {
    it('llama a onSubmit con los datos recortados', async () => {
      const onSubmit = vi.fn()
      render(<ClientForm onSubmit={onSubmit} />)

      await userEvent.type(screen.getByLabelText(/^nombre/i), '  Ana Pérez  ')
      await userEvent.type(
        screen.getByLabelText(/^empresa/i),
        ' Comercial del Norte ',
      )
      await userEvent.type(
        screen.getByLabelText(/^correo/i),
        ' ana@ejemplo.example ',
      )
      await userEvent.click(
        screen.getByRole('button', { name: /preparar el documento/i }),
      )

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Ana Pérez',
        company: 'Comercial del Norte',
        email: 'ana@ejemplo.example',
      })
    })

    it('envía la empresa y el correo vacíos si no se rellenan', async () => {
      const onSubmit = vi.fn()
      render(<ClientForm onSubmit={onSubmit} />)

      await userEvent.type(screen.getByLabelText(/^nombre/i), 'Ana Pérez')
      await userEvent.click(
        screen.getByRole('button', { name: /preparar el documento/i }),
      )

      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Ana Pérez',
        company: '',
        email: '',
      })
    })
  })

  it('no envía los datos del cliente a ninguna parte', async () => {
    /*
     * **El test que sostiene la promesa de la fase**: los datos del cliente no
     * salen del navegador. Lo comprueba por tres vías, porque las tres son
     * formas reales de que algo se escape:
     *
     * 1. `fetch` no se llama. Es como se haría una petición hoy.
     * 2. El formulario no tiene `action`, así que el navegador no tiene a dónde
     *    enviarlo. Un `<form>` sin `action` y sin `preventDefault` recargaría la
     *    página con los datos en la URL, que es exactamente lo que no debe pasar.
     * 3. La página no ha navegado: `onSubmit` se ha llamado y el formulario
     *    sigue ahí, lo que demuestra que el envío se ha interceptado.
     */
    const fetchFalso = vi.fn()
    vi.stubGlobal('fetch', fetchFalso)

    const onSubmit = vi.fn()
    render(<ClientForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/^nombre/i), 'Ana Pérez')
    await userEvent.type(
      screen.getByLabelText(/^correo/i),
      'ana@ejemplo.example',
    )
    await userEvent.click(
      screen.getByRole('button', { name: /preparar el documento/i }),
    )

    expect(fetchFalso).not.toHaveBeenCalled()
    expect(screen.getByRole('form')).not.toHaveAttribute('action')
    expect(onSubmit).toHaveBeenCalledTimes(1)

    vi.unstubAllGlobals()
  })

  it('no usa la validación del navegador, para dar los mensajes en español', async () => {
    /*
     * `noValidate` desactiva los mensajes del navegador. No es un capricho: esos
     * mensajes salen en el idioma del navegador, no se pueden redactar, no se
     * pueden asociar a un campo con `aria-describedby` y no se pueden probar.
     * El apartado 2 de `CLAUDE.md` exige los textos de interfaz en español.
     */
    render(<ClientForm onSubmit={vi.fn()} />)

    expect(screen.getByRole('form')).toHaveAttribute('novalidate')
  })
})
