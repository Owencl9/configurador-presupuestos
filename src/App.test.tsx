import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import App from './App'

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
