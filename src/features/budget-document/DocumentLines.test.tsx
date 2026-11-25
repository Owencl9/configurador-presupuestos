import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { BudgetLine } from '../../shared/types/budget'
import type {
  MonthlyService,
  OneTimeService,
  YearlyService,
} from '../../shared/types/service'

import { DocumentLines } from './DocumentLines'

const WEB: OneTimeService = {
  id: 'web',
  name: 'Web corporativa',
  description: 'Solo para los tests.',
  category: 'web-design',
  priceCents: 120_000, // 1.200,00 €
  payment: 'one-time',
}

const SEO: MonthlyService = {
  id: 'seo',
  name: 'SEO Profesional',
  description: 'Solo para los tests.',
  category: 'marketing',
  priceCents: 45_000, // 450,00 €/mes
  payment: 'monthly',
  minMonths: 6,
}

const HOSTING: YearlyService = {
  id: 'hosting',
  name: 'Hosting y dominio',
  description: 'Solo para los tests.',
  category: 'infrastructure',
  priceCents: 12_000, // 120,00 €/año
  payment: 'yearly',
}

const LINEAS: readonly BudgetLine[] = [
  { service: WEB, quantity: 2 },
  { service: SEO, quantity: 1, months: 12 },
  { service: HOSTING, quantity: 1 },
]

describe('DocumentLines', () => {
  it('es una lista con un elemento por línea', () => {
    render(<DocumentLines lines={LINEAS} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('muestra el nombre de cada servicio', () => {
    render(<DocumentLines lines={LINEAS} />)

    expect(screen.getByText('Web corporativa')).toBeInTheDocument()
    expect(screen.getByText('SEO Profesional')).toBeInTheDocument()
    expect(screen.getByText('Hosting y dominio')).toBeInTheDocument()
  })

  it('muestra el importe de cada línea con su sufijo de pago', () => {
    /*
     * Dos webs son 2.400,00 €, y el sufijo distingue la cuota del pago único:
     * un «450,00 €» suelto, en una hoja impresa que alguien lee en voz alta o
     * fotocopia, no dice si es una vez o cada mes.
     */
    render(<DocumentLines lines={LINEAS} />)

    expect(screen.getByText('2.400,00 €')).toBeInTheDocument()
    expect(screen.getByText('450,00 €/mes')).toBeInTheDocument()
    expect(screen.getByText('120,00 €/año')).toBeInTheDocument()
  })

  it('muestra la cantidad y el precio por unidad', () => {
    // Con dos unidades, el importe de la línea no se explica solo: hace falta
    // ver de dónde sale. Con una, decirlo también mantiene las líneas iguales.
    render(<DocumentLines lines={LINEAS} />)

    expect(screen.getByText(/2 unidades × 1\.200,00 €/)).toBeInTheDocument()
    expect(screen.getByText(/1 unidad × 450,00 €\/mes/)).toBeInTheDocument()
  })

  it('muestra los meses solo en las líneas mensuales', () => {
    /*
     * Los meses de contratación son parte del compromiso y van impresos. En una
     * línea de pago único no existen: `BudgetLine` es una unión discriminada y
     * una línea de pago único no tiene el campo (Fase 4).
     */
    render(<DocumentLines lines={LINEAS} />)

    expect(screen.getByText(/12 meses/)).toBeInTheDocument()
    expect(screen.getAllByText(/meses/)).toHaveLength(1)
  })

  it('no tiene ningún botón', () => {
    /*
     * **El test que define qué es este componente.** El documento se lee, no se
     * edita: ni botones de quitar, ni de más y menos. Sin esto, la tentación
     * sería reutilizar `BudgetLineItem` y esconder los botones con CSS de
     * impresión, y entonces seguirían estando en la pantalla del documento y en
     * el recorrido del teclado.
     */
    render(<DocumentLines lines={LINEAS} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('no tiene ningún campo de formulario', () => {
    render(<DocumentLines lines={LINEAS} />)

    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('no muestra el compromiso total de los servicios mensuales', () => {
    /*
     * **Guardián del [ADR 0011](../../../docs/adr/0011-sin-compromiso-total.md).**
     * 450,00 €/mes × 12 meses son 5.400,00 €, y esa cifra no se muestra: es la
     * más alta de la hoja, la más fácil de confundir con «lo que cuesta todo» y
     * además parcial, porque no incluye el pago inicial ni el anual.
     *
     * El ADR avisa de que **la Fase 7 es su momento de riesgo**, porque el
     * documento invita a rellenar huecos con cifras «para que quede completo».
     * Este test es lo que hace que ese aviso no dependa de que alguien se
     * acuerde de leerlo.
     */
    render(<DocumentLines lines={LINEAS} />)

    expect(screen.queryByText(/5\.400,00/)).not.toBeInTheDocument()
  })
})
