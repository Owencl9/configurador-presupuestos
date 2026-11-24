import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SERVICES } from '../../shared/data/services'
import { ServiceCatalog } from './ServiceCatalog'

/*
 * Estos tests sí usan el catálogo real, al contrario que los de las dos
 * funciones. El motivo: aquí lo que se comprueba es que el catálogo completo
 * llega a la pantalla bien estructurado, así que probarlo con datos inventados
 * no demostraría lo que interesa. Funciona además como test de integración de
 * las tres piezas de la fase: los datos, la agrupación y el formato del precio.
 */
describe('ServiceCatalog', () => {
  it('muestra las cuatro categorías como encabezados de nivel 2, en el orden del catálogo', () => {
    render(<ServiceCatalog selectedIds={[]} onToggle={vi.fn()} />)

    const encabezados = screen
      .getAllByRole('heading', { level: 2 })
      .map((encabezado) => encabezado.textContent)

    expect(encabezados).toEqual([
      'Diseño web',
      'Marketing',
      'Mantenimiento',
      'Infraestructura',
    ])
  })

  it('muestra los doce servicios del catálogo', () => {
    render(<ServiceCatalog selectedIds={[]} onToggle={vi.fn()} />)

    // Nivel 3 porque van dentro de una categoría, que es nivel 2. La jerarquía
    // completa de la página es h1 (título) → h2 (categoría) → h3 (servicio),
    // sin saltos: lo exige el apartado 3 de CLAUDE.md.
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(
      SERVICES.length,
    )
    expect(
      screen.getByRole('heading', { level: 3, name: 'Tienda online' }),
    ).toBeInTheDocument()
  })

  it('agrupa cada servicio bajo su categoría, en secciones con nombre', () => {
    render(<ServiceCatalog selectedIds={[]} onToggle={vi.fn()} />)

    // Cada categoría es una región con nombre accesible, de modo que un lector
    // de pantalla pueda saltar directamente a «Marketing» sin recorrer las
    // tarjetas anteriores una por una.
    const regiones = screen.getAllByRole('region')

    expect(regiones).toHaveLength(4)
    expect(
      screen.getByRole('region', { name: 'Marketing' }),
    ).toBeInTheDocument()
  })

  it('muestra el precio de cada servicio con el sufijo de su forma de pago', () => {
    render(<ServiceCatalog selectedIds={[]} onToggle={vi.fn()} />)

    expect(screen.getByText('2.500,00 €')).toBeInTheDocument() // pago único
    expect(screen.getByText('250,00 €/mes')).toBeInTheDocument() // mensual
    expect(screen.getByText('120,00 €/año')).toBeInTheDocument() // anual
  })

  it('avisa mediante onToggle con el identificador del servicio pulsado', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<ServiceCatalog selectedIds={[]} onToggle={onToggle} />)

    await user.click(
      screen.getByRole('button', { name: 'Añadir SEO Básico al presupuesto' }),
    )

    // Se comprueba el identificador, no el nombre: el presupuesto se construye
    // con identificadores estables, no con textos que pueden cambiar.
    expect(onToggle).toHaveBeenCalledWith('seo-basic')
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('marca como pulsados solo los servicios seleccionados', () => {
    render(<ServiceCatalog selectedIds={['online-store']} onToggle={vi.fn()} />)

    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(1)
    expect(screen.getByRole('button', { pressed: true })).toHaveAccessibleName(
      'Quitar Tienda online del presupuesto',
    )
  })
})
