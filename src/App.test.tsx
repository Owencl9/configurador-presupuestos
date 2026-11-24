import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import App from './App'
import { DRAFT_STORAGE_KEY } from './features/budget/draftFormat'

/*
 * Test de integración de la Fase 4: el catálogo, el presupuesto y el cálculo
 * funcionando juntos, con el catálogo **real** de 12 servicios.
 *
 * Los tests anteriores prueban cada pieza aislada. Este prueba lo único que
 * ninguno de ellos puede ver: que las piezas están bien conectadas. Es donde se
 * detectaría, por ejemplo, que quitar un servicio desde el presupuesto no lo
 * desmarca en el catálogo.
 *
 * Importes que se usan abajo, del catálogo real y con el IGIC del 7 %:
 *
 *   Web corporativa  1.200,00 €     + IGIC 84,00 € = 1.284,00 €
 *   SEO Básico         250,00 €/mes + IGIC 17,50 € =   267,50 €/mes
 */

/** El panel del presupuesto, para distinguirlo del catálogo. */
const panel = () => screen.getByRole('region', { name: 'Tu presupuesto' })

/**
 * La sección «Diseño web» del catálogo.
 *
 * Hace falta porque el botón de quitar del catálogo y el de la línea del
 * presupuesto tienen **el mismo nombre accesible**, y es deliberado: es la
 * misma acción vista desde dos sitios. Lo que los distingue es la región en la
 * que están, que es también como los distingue quien navega con un lector de
 * pantalla.
 */
const catalogoWeb = () => screen.getByRole('region', { name: 'Diseño web' })

describe('App', () => {
  it('arranca con el presupuesto vacío y sin el contador provisional', () => {
    render(<App />)

    expect(
      screen.getByText(/Todavía no has añadido ningún servicio/),
    ).toBeInTheDocument()

    // El contador «Servicios seleccionados: 0» de la Fase 2 era provisional y
    // lo sustituye este panel (pendiente nº 8 de PROGRESO.md).
    expect(
      screen.queryByText(/Servicios seleccionados/),
    ).not.toBeInTheDocument()
  })

  it('añade un servicio del catálogo al presupuesto, con su importe calculado', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', {
        name: 'Añadir Web corporativa al presupuesto',
      }),
    )

    expect(within(panel()).getByText('Web corporativa')).toBeInTheDocument()
    expect(
      screen.getByText(
        '1 servicio en el presupuesto. A pagar el primer día (orientativo): 1.284,00 €',
      ),
    ).toBeInTheDocument()
  })

  it('suma los servicios de distinta forma de pago en bloques separados', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', {
        name: 'Añadir Web corporativa al presupuesto',
      }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Añadir SEO Básico al presupuesto' }),
    )

    // 1.284,00 € + 267,50 €: lo que coincide el primer día, no un total del
    // presupuesto, que no existe (ADR 0007).
    expect(
      screen.getByText(
        '2 servicios en el presupuesto. A pagar el primer día (orientativo): 1.551,50 €',
      ),
    ).toBeInTheDocument()
    expect(
      within(panel()).getByRole('heading', { name: 'Pago inicial' }),
    ).toBeInTheDocument()
    expect(
      within(panel()).getByRole('heading', { name: 'Cuota mensual' }),
    ).toBeInTheDocument()
  })

  describe('quitar un servicio, desde los dos sitios', () => {
    it('quitarlo desde la línea del presupuesto lo desmarca en el catálogo', async () => {
      const user = userEvent.setup()
      render(<App />)

      await user.click(
        screen.getByRole('button', {
          name: 'Añadir Web corporativa al presupuesto',
        }),
      )

      // Con el servicio añadido, la tarjeta del catálogo está «pulsada».
      expect(
        within(catalogoWeb()).getByRole('button', {
          name: 'Quitar Web corporativa del presupuesto',
          pressed: true,
        }),
      ).toBeInTheDocument()

      await user.click(
        within(panel()).getByRole('button', {
          name: 'Quitar Web corporativa del presupuesto',
        }),
      )

      // La tarjeta vuelve a ofrecer «Añadir»: las dos partes de la pantalla
      // miran el mismo estado y no dos copias que puedan discrepar.
      expect(
        within(catalogoWeb()).getByRole('button', {
          name: 'Añadir Web corporativa al presupuesto',
          pressed: false,
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Todavía no has añadido ningún servicio/),
      ).toBeInTheDocument()
    })

    it('quitarlo desde el catálogo lo saca del presupuesto', async () => {
      const user = userEvent.setup()
      render(<App />)

      await user.click(
        screen.getByRole('button', {
          name: 'Añadir Web corporativa al presupuesto',
        }),
      )
      await user.click(
        within(catalogoWeb()).getByRole('button', {
          name: 'Quitar Web corporativa del presupuesto',
        }),
      )

      expect(
        within(panel()).queryByText('Web corporativa'),
      ).not.toBeInTheDocument()
    })
  })

  it('recalcula el presupuesto al cambiar la cantidad', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', {
        name: 'Añadir Web corporativa al presupuesto',
      }),
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Aumentar Cantidad de Web corporativa',
      }),
    )

    // 2 × 1.200,00 € = 2.400,00 €, + IGIC 168,00 € = 2.568,00 €.
    expect(
      screen.getByText(
        '1 servicio en el presupuesto. A pagar el primer día (orientativo): 2.568,00 €',
      ),
    ).toBeInTheDocument()
  })

  it('cambia los meses sin cambiar ningún importe', async () => {
    /*
     * Este test fija por escrito algo que puede parecer un fallo al probar la
     * aplicación a mano: subir los meses de 6 a 7 **no mueve ninguna cifra**.
     * La cuota mensual es la de un mes, y los meses no la multiplican.
     *
     * Son el dato del descuento por permanencia de la Fase 6, que es cuando
     * empezarán a cambiar un importe. Si alguien «arregla» esto multiplicando,
     * este test se lo dirá.
     */
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', { name: 'Añadir SEO Básico al presupuesto' }),
    )

    const frase =
      '1 servicio en el presupuesto. A pagar el primer día (orientativo): 267,50 €'

    expect(screen.getByText(frase)).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Aumentar Meses de SEO Básico' }),
    )

    expect(
      screen.getByRole('spinbutton', { name: 'Meses de SEO Básico' }),
    ).toHaveValue(7)
    expect(screen.getByText(frase)).toBeInTheDocument()
  })

  it('mantiene la jerarquía de encabezados sin saltos', () => {
    render(<App />)

    // h1 el título, h2 las categorías del catálogo y «Tu presupuesto».
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'Configurador de Presupuestos',
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'Tu presupuesto' }),
    ).toBeInTheDocument()
  })
})

/*
 * Tests de integración de la Fase 5: el estado global y los borradores, con la
 * aplicación entera y el catálogo real.
 *
 * Lo que prueban y no puede probar ningún test anterior es el viaje completo:
 * que lo que se pulsa en pantalla acaba en `localStorage`, y que lo que hay en
 * `localStorage` acaba en pantalla con los importes del catálogo.
 *
 * Desmontar la aplicación y volver a montarla es lo más parecido a recargar la
 * página que se puede hacer en un test: el navegador simulado y su
 * `localStorage` siguen ahí, igual que al pulsar F5, y la aplicación arranca
 * desde cero. El `localStorage` se vacía antes de cada test en
 * `src/test/setup.ts`.
 */
describe('App — el borrador del presupuesto', () => {
  const pedirWeb = (user: ReturnType<typeof userEvent.setup>) =>
    user.click(
      screen.getByRole('button', {
        name: 'Añadir Web corporativa al presupuesto',
      }),
    )

  /** Un borrador escrito a mano, como el que puede haber en un navegador. */
  function guardarBorrador(lines: readonly Record<string, unknown>[]) {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ lines }))
  }

  it('el presupuesto sigue ahí al volver a abrir la aplicación', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)

    await pedirWeb(user)
    await user.click(
      screen.getByRole('button', { name: 'Añadir SEO Básico al presupuesto' }),
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Aumentar Cantidad de Web corporativa',
      }),
    )

    unmount()
    render(<App />)

    expect(within(panel()).getByText('Web corporativa')).toBeInTheDocument()
    expect(within(panel()).getByText('SEO Básico')).toBeInTheDocument()
    expect(
      screen.getByRole('spinbutton', { name: 'Cantidad de Web corporativa' }),
    ).toHaveValue(2)

    // Y el catálogo aparece marcado, porque lo marcado se deriva de las líneas.
    expect(
      within(catalogoWeb()).getByRole('button', {
        name: 'Quitar Web corporativa del presupuesto',
        pressed: true,
      }),
    ).toBeInTheDocument()
  })

  it('no se pierde el borrador en el primer render', () => {
    // El riesgo que pidió cubrir el usuario, aquí visto desde la aplicación
    // entera: el borrador se lee al crear el estado, así que no hay ningún
    // instante en que el presupuesto esté vacío y se guarde encima.
    guardarBorrador([{ serviceId: 'corporate-website', quantity: 1 }])
    const guardadoAntes = localStorage.getItem(DRAFT_STORAGE_KEY)

    render(<App />)

    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBe(guardadoAntes)
    expect(within(panel()).getByText('Web corporativa')).toBeInTheDocument()
  })

  it('un precio escrito a mano en el borrador no cambia ningún importe', () => {
    /*
     * El motivo por el que el borrador guarda solo identificadores. Alguien
     * edita el almacenamiento del navegador y afirma que la web corporativa
     * cuesta un céntimo: la aplicación la cobra a 1.200,00 € + IGIC, porque el
     * precio sale del catálogo y lo guardado no se mira para eso.
     */
    guardarBorrador([
      { serviceId: 'corporate-website', quantity: 1, priceCents: 1 },
    ])

    render(<App />)

    expect(
      screen.getByText(
        '1 servicio en el presupuesto. A pagar el primer día (orientativo): 1.284,00 €',
      ),
    ).toBeInTheDocument()
  })

  it('descarta la línea de un servicio que no existe y conserva el resto', () => {
    guardarBorrador([
      { serviceId: 'servicio-que-ya-no-existe', quantity: 1 },
      { serviceId: 'corporate-website', quantity: 1 },
    ])

    render(<App />)

    expect(
      screen.getByText(
        '1 servicio en el presupuesto. A pagar el primer día (orientativo): 1.284,00 €',
      ),
    ).toBeInTheDocument()
  })

  it('corrige los números imposibles de un borrador editado a mano', () => {
    // 500 meses y 10.000 unidades: se acercan al rango por el lado por el que
    // se han salido (36 meses y 99 unidades), no se descarta la línea.
    guardarBorrador([{ serviceId: 'seo-basic', quantity: 10_000, months: 500 }])

    render(<App />)

    expect(
      screen.getByRole('spinbutton', { name: 'Cantidad de SEO Básico' }),
    ).toHaveValue(99)
    expect(
      screen.getByRole('spinbutton', { name: 'Meses de SEO Básico' }),
    ).toHaveValue(36)
  })

  it('arranca vacío y sin romperse si el borrador está dañado', () => {
    localStorage.setItem(DRAFT_STORAGE_KEY, '{"lines":[{"serviceId":')

    expect(() => render(<App />)).not.toThrow()
    expect(
      screen.getByText(/Todavía no has añadido ningún servicio/),
    ).toBeInTheDocument()
  })

  describe('empezar de nuevo', () => {
    it('no ofrece el botón con el presupuesto vacío', () => {
      render(<App />)

      expect(
        screen.queryByRole('button', { name: 'Empezar de nuevo' }),
      ).not.toBeInTheDocument()
    })

    it('cancelar deja el presupuesto como estaba', async () => {
      const user = userEvent.setup()
      render(<App />)

      await pedirWeb(user)
      await user.click(screen.getByRole('button', { name: 'Empezar de nuevo' }))
      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(within(panel()).getByText('Web corporativa')).toBeInTheDocument()
      expect(localStorage.getItem(DRAFT_STORAGE_KEY)).not.toBeNull()
    })

    it('confirmar vacía el presupuesto y borra el borrador guardado', async () => {
      const user = userEvent.setup()
      render(<App />)

      await pedirWeb(user)
      await user.click(screen.getByRole('button', { name: 'Empezar de nuevo' }))
      await user.click(
        screen.getByRole('button', { name: 'Sí, borrar el presupuesto' }),
      )

      expect(
        screen.getByText(/Todavía no has añadido ningún servicio/),
      ).toBeInTheDocument()
      expect(
        within(catalogoWeb()).getByRole('button', {
          name: 'Añadir Web corporativa al presupuesto',
          pressed: false,
        }),
      ).toBeInTheDocument()
      expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull()

      // Y el foco acaba en el mensaje de que se ha borrado, porque el botón
      // que se acaba de pulsar ya no existe.
      expect(screen.getByText(/Se ha borrado el presupuesto/)).toHaveFocus()
    })

    it('lo borrado no vuelve al recargar', async () => {
      const user = userEvent.setup()
      const { unmount } = render(<App />)

      await pedirWeb(user)
      await user.click(screen.getByRole('button', { name: 'Empezar de nuevo' }))
      await user.click(
        screen.getByRole('button', { name: 'Sí, borrar el presupuesto' }),
      )

      unmount()
      render(<App />)

      expect(
        screen.getByText(/Todavía no has añadido ningún servicio/),
      ).toBeInTheDocument()
    })
  })
})
