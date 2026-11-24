import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ServiceCard } from './ServiceCard'

// Datos fijos para todos los tests. El precio llega ya formateado: en esta fase
// ServiceCard es puramente presentacional y no calcula ni formatea nada. El
// formato de euros se implementará con su propio TDD en la Fase 3.
const SERVICIO = {
  name: 'Web corporativa',
  description: 'Sitio web de hasta 5 páginas, adaptado a móvil.',
  priceLabel: '1.200,00 €',
}

describe('ServiceCard', () => {
  it('muestra el nombre, la descripción y el precio del servicio', () => {
    render(<ServiceCard {...SERVICIO} selected={false} onToggle={vi.fn()} />)

    // Se busca por rol de encabezado, no por texto suelto: así el test
    // comprueba además que el nombre del servicio es un encabezado real y
    // aparece en el índice de un lector de pantalla.
    expect(
      screen.getByRole('heading', { name: 'Web corporativa' }),
    ).toBeInTheDocument()
    expect(screen.getByText(SERVICIO.description)).toBeInTheDocument()
    expect(screen.getByText('1.200,00 €')).toBeInTheDocument()
  })

  it('ofrece un botón cuyo nombre accesible identifica el servicio', () => {
    render(<ServiceCard {...SERVICIO} selected={false} onToggle={vi.fn()} />)

    // Un botón que solo diga «Añadir» es ambiguo si hay varias tarjetas en
    // pantalla: quien navega por lista de botones no sabe a qué se refiere.
    expect(screen.getByRole('button')).toHaveAccessibleName(
      'Añadir Web corporativa al presupuesto',
    )
  })

  it('avisa mediante onToggle cuando se pulsa el botón', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<ServiceCard {...SERVICIO} selected={false} onToggle={onToggle} />)

    await user.click(screen.getByRole('button'))

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('no está marcado como pulsado cuando el servicio no está seleccionado', () => {
    render(<ServiceCard {...SERVICIO} selected={false} onToggle={vi.fn()} />)

    expect(screen.getByRole('button', { pressed: false })).toBeInTheDocument()
  })

  it('está marcado como pulsado y permite quitar el servicio cuando está seleccionado', () => {
    render(<ServiceCard {...SERVICIO} selected onToggle={vi.fn()} />)

    expect(screen.getByRole('button', { pressed: true })).toHaveAccessibleName(
      'Quitar Web corporativa del presupuesto',
    )
  })
})
